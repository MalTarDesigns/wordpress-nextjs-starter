import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { previewMiddleware } from "@/lib/preview/middleware";

// WordPress redirect item type
interface RedirectItem {
  id: number;
  url: string;
  action_data: {
    url: string;
  };
  action_code: number;
  match_type: string;
  enabled: boolean;
}

// WordPress redirect API response
interface RedirectResponse {
  items: RedirectItem[];
  total: number;
}

// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100; // requests per window
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Helper function to check rate limits
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

// Helper function to handle WordPress redirects
async function handleWordPressRedirects(
  request: NextRequest,
  pathnameWithoutTrailingSlash: string
): Promise<NextResponse | null> {
  // Check if WordPress redirect handling is enabled
  if (!process.env.WP_USER || !process.env.WP_APP_PASS) {
    return null;
  }

  const basicAuth = `${process.env.WP_USER}:${process.env.WP_APP_PASS}`;
  const encodedAuth = Buffer.from(basicAuth).toString('base64');
  
  try {
    const redirectUrl = new URL(
      `/wp-json/redirection/v1/redirect/`,
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL
    );
    
    redirectUrl.searchParams.set('filterBy[url-match]', 'plain');
    redirectUrl.searchParams.set('filterBy[url]', pathnameWithoutTrailingSlash);

    const response = await fetch(redirectUrl.toString(), {
      headers: {
        'Authorization': `Basic ${encodedAuth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Next.js Middleware',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.warn(`WordPress redirect API returned ${response.status}`);
      return null;
    }

    const data: RedirectResponse = await response.json();

    if (data?.items?.length > 0) {
      const redirect = data.items.find(
        (item: RedirectItem) => 
          item.url === pathnameWithoutTrailingSlash && 
          item.enabled
      );

      if (redirect) {
        const targetUrl = redirect.action_data.url;
        
        // Validate the redirect URL
        try {
          const newUrl = targetUrl.startsWith('/')
            ? new URL(targetUrl, process.env.NEXT_PUBLIC_BASE_URL).toString()
            : targetUrl;
            
          // Prevent redirect loops
          if (new URL(newUrl).pathname === pathnameWithoutTrailingSlash) {
            console.warn(`Redirect loop detected for ${pathnameWithoutTrailingSlash}`);
            return null;
          }

          console.log(`Redirecting ${pathnameWithoutTrailingSlash} to ${newUrl}`);
          
          return NextResponse.redirect(newUrl, {
            status: redirect.action_code === 301 ? 308 : 307, // Use 308/307 for permanent/temporary redirects
            headers: {
              'Cache-Control': redirect.action_code === 301 
                ? 'public, max-age=31536000' // Cache permanent redirects for 1 year
                : 'no-cache', // Don't cache temporary redirects
            },
          });
        } catch (urlError) {
          console.error(`Invalid redirect URL: ${targetUrl}`, urlError);
          return null;
        }
      }
    }
  } catch (error) {
    // Log error but don't fail the request
    console.error('WordPress redirect check failed:', error);
  }
  
  return null;
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Get client IP for rate limiting
  const clientIP = 
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Apply rate limiting (skip for static assets)
  if (!pathname.startsWith('/_next/') && 
      !pathname.startsWith('/favicon') && 
      !pathname.includes('.')) {
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '900', // 15 minutes
        },
      });
    }
  }

  // Block known bad bots and crawlers
  const badBots = [
    'semrushbot',
    'ahrefsbot',
    'dotbot',
    'mj12bot',
    'majestic12',
    'blexbot',
  ];
  
  if (badBots.some(bot => userAgent.toLowerCase().includes(bot))) {
    console.log(`Blocked bad bot: ${userAgent}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Handle special Next.js routes
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/api/') ||
      pathname === '/favicon.ico' ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml') {
    return NextResponse.next();
  }

  // Handle preview requests with comprehensive validation
  const isPreviewRequest = search.includes('preview=true') || 
                          pathname.includes('/preview/') || 
                          pathname.includes('/private/');
  
  if (isPreviewRequest) {
    const previewResponse = await previewMiddleware(request);
    if (previewResponse) {
      return previewResponse;
    }
    // If preview middleware returns null, continue with default preview handling
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // Clean pathname for redirect checking
  const pathnameWithoutTrailingSlash = pathname.replace(/\/$/, '') || '/';

  // Check for WordPress redirects
  const redirectResponse = await handleWordPressRedirects(
    request,
    pathnameWithoutTrailingSlash
  );
  
  if (redirectResponse) {
    return redirectResponse;
  }

  // Create response with security headers
  const response = NextResponse.next();
  
  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', 
      process.env.NEXT_PUBLIC_BASE_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 
      'Content-Type, Authorization, X-Headless-Secret-Key');
  }
  
  // Add cache headers for static content
  if (pathname.includes('.') && !pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Add performance headers
  response.headers.set('X-Powered-By', 'Next.js + WordPress');
  
  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
