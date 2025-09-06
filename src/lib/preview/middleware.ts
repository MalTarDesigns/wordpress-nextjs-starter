/**
 * Preview Middleware for Token Validation and Security
 * Server-side middleware functions for preview mode validation
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  validatePreviewAccess, 
  performSecurityCheck, 
  validatePreviewUrl,
  logSecurityEvent,
  createSecurityReport
} from "./validation";
import { clearPreviewCookies } from "./cookies";
import { envConfig } from "@/lib/env";

// Preview middleware options
export interface PreviewMiddlewareOptions {
  enableSecurityChecks?: boolean;
  enableRateLimiting?: boolean;
  logSecurityEvents?: boolean;
  blockSuspiciousRequests?: boolean;
  requireValidSession?: boolean;
  maxInactiveMinutes?: number;
}

// Default middleware options
const DEFAULT_OPTIONS: PreviewMiddlewareOptions = {
  enableSecurityChecks: true,
  enableRateLimiting: true,
  logSecurityEvents: true,
  blockSuspiciousRequests: true,
  requireValidSession: true,
  maxInactiveMinutes: 30,
};

// Rate limiting store for preview requests
const rateLimitStore = new Map<string, { count: number; resetTime: number; violations: number }>();

/**
 * Main preview middleware function
 */
export async function previewMiddleware(
  request: NextRequest,
  options: PreviewMiddlewareOptions = {}
): Promise<NextResponse | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Only process preview-related requests
  const url = request.nextUrl;
  const isPreviewRequest = url.pathname.includes('/preview/') || 
                          url.pathname.includes('/private/') ||
                          url.searchParams.get('preview') === 'true';

  if (!isPreviewRequest) {
    return null; // Let other middleware handle non-preview requests
  }

  try {
    // 1. Perform security checks
    if (opts.enableSecurityChecks) {
      const securityCheck = performSecurityCheck(request);
      
      if (opts.logSecurityEvents && securityCheck.issues.length > 0) {
        logSecurityEvent("security_violation", {
          ip: securityCheck.clientInfo.ip,
          reason: securityCheck.issues.join(", "),
          riskLevel: securityCheck.riskLevel,
          userAgent: securityCheck.clientInfo.userAgent,
        });
      }

      if (opts.blockSuspiciousRequests && securityCheck.blocked) {
        console.warn("Blocking suspicious preview request", {
          ip: securityCheck.clientInfo.ip,
          issues: securityCheck.issues,
        });
        
        return new NextResponse("Access Denied", { status: 403 });
      }
    }

    // 2. Apply rate limiting
    if (opts.enableRateLimiting) {
      const rateLimitResult = checkRateLimit(
        request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      );
      
      if (!rateLimitResult.allowed) {
        if (opts.logSecurityEvents) {
          logSecurityEvent("preview_access", {
            ip: rateLimitResult.clientIP,
            reason: "Rate limit exceeded",
          });
        }
        
        return new NextResponse("Too Many Requests", { 
          status: 429,
          headers: {
            'Retry-After': '900', // 15 minutes
            'X-RateLimit-Remaining': '0',
          },
        });
      }
    }

    // 3. Validate preview URL structure
    const urlValidation = validatePreviewUrl(request.url);
    if (!urlValidation.isValid) {
      console.error("Invalid preview URL structure", {
        url: request.url,
        errors: urlValidation.errors,
      });
      
      return new NextResponse("Invalid Preview URL", { status: 400 });
    }

    // 4. Validate preview access (authentication, permissions, session)
    if (opts.requireValidSession) {
      const validation = await validatePreviewAccess(
        request,
        urlValidation.contentId,
        url.searchParams.get('status') || undefined
      );

      // Create security report
      const securityCheck = opts.enableSecurityChecks ? 
        performSecurityCheck(request) : 
        { passed: true, blocked: false, riskLevel: "low" as const, issues: [], clientInfo: { ip: "", userAgent: "" } };
        
      const securityReport = createSecurityReport(validation, securityCheck, urlValidation.contentId);

      // Log security events
      if (opts.logSecurityEvents) {
        if (!validation.isValid) {
          logSecurityEvent("permission_denied", {
            ip: request.ip || 'unknown',
            userId: validation.userId,
            contentId: urlValidation.contentId,
            reason: validation.error || "Access validation failed",
          });
        }

        if (validation.isExpired) {
          logSecurityEvent("session_expired", {
            ip: request.ip || 'unknown',
            userId: validation.userId,
            contentId: urlValidation.contentId,
            reason: "Preview session expired",
          });
        }
      }

      // Handle validation failures
      if (securityReport.overall === "danger") {
        console.error("Preview access denied", {
          blockers: securityReport.blockers,
          contentId: urlValidation.contentId,
          userId: validation.userId,
        });

        // Clear potentially compromised cookies
        const errorResponse = new NextResponse("Access Denied", { status: 403 });
        clearPreviewCookies(errorResponse);
        return errorResponse;
      }

      // Handle warnings (allow access but add headers)
      if (securityReport.overall === "warning") {
        console.warn("Preview access with warnings", {
          recommendations: securityReport.recommendations,
          contentId: urlValidation.contentId,
          userId: validation.userId,
        });

        // Continue with request but add warning headers
        const response = NextResponse.next();
        response.headers.set("X-Preview-Warning", "true");
        response.headers.set("X-Preview-Recommendations", securityReport.recommendations.join("; "));
        return response;
      }
    }

    // 5. Add preview-specific headers for successful validation
    const response = NextResponse.next();
    response.headers.set("X-Preview-Mode", "enabled");
    response.headers.set("X-Preview-Validated", "true");
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;

  } catch (error) {
    console.error("Preview middleware error:", error);
    
    if (opts.logSecurityEvents) {
      logSecurityEvent("security_violation", {
        ip: request.ip || 'unknown',
        reason: "Middleware processing error",
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    }

    // Return error response with cleaned cookies
    const errorResponse = new NextResponse("Internal Server Error", { status: 500 });
    clearPreviewCookies(errorResponse);
    return errorResponse;
  }
}

/**
 * Rate limiting for preview requests
 */
function checkRateLimit(clientIP: string): {
  allowed: boolean;
  clientIP: string;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 50; // Max 50 preview requests per 15 minutes
  const maxViolations = 3; // Max 3 violations before extended timeout

  let record = rateLimitStore.get(clientIP);

  // Initialize or reset expired record
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + windowMs,
      violations: record?.violations || 0,
    };
  }

  record.count++;

  // Check for violations (extended penalty for repeat offenders)
  if (record.count > maxRequests) {
    record.violations++;
    
    // Extended timeout for repeat violators
    if (record.violations >= maxViolations) {
      record.resetTime = now + (windowMs * 4); // 1 hour timeout
    }
    
    rateLimitStore.set(clientIP, record);
    return {
      allowed: false,
      clientIP,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  rateLimitStore.set(clientIP, record);
  return {
    allowed: true,
    clientIP,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Clean up expired rate limit records
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime && record.count === 0) {
      rateLimitStore.delete(ip);
    }
  }
}

/**
 * Get rate limit info for an IP
 */
export function getRateLimitInfo(clientIP: string): {
  remaining: number;
  resetTime: number;
  violations: number;
} {
  const record = rateLimitStore.get(clientIP);
  const now = Date.now();
  
  if (!record || now > record.resetTime) {
    return {
      remaining: 50, // Max requests
      resetTime: now + (15 * 60 * 1000), // 15 minutes from now
      violations: record?.violations || 0,
    };
  }

  return {
    remaining: Math.max(0, 50 - record.count),
    resetTime: record.resetTime,
    violations: record.violations,
  };
}

/**
 * Middleware for API routes to validate preview tokens
 */
export async function apiPreviewMiddleware(
  request: NextRequest,
  requiredPermission?: "edit" | "publish"
): Promise<{ 
  isValid: boolean; 
  userId?: string; 
  error?: string;
  response?: NextResponse;
}> {
  try {
    // Validate preview access
    const validation = await validatePreviewAccess(request);
    
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error || "Invalid preview access",
        response: new NextResponse(
          JSON.stringify({ error: validation.error || "Unauthorized" }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }

    // Check specific permissions if required
    if (requiredPermission === "edit" && !validation.userCanAccess) {
      return {
        isValid: false,
        error: "Insufficient permissions for editing",
        response: new NextResponse(
          JSON.stringify({ error: "Insufficient permissions" }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }

    if (requiredPermission === "publish" && !validation.userRoles.includes("administrator") && !validation.userRoles.includes("editor")) {
      return {
        isValid: false,
        error: "Insufficient permissions for publishing",
        response: new NextResponse(
          JSON.stringify({ error: "Insufficient permissions" }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }

    return {
      isValid: true,
      userId: validation.userId,
    };

  } catch (error) {
    console.error("API preview middleware error:", error);
    return {
      isValid: false,
      error: "Internal server error",
      response: new NextResponse(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }
}

/**
 * Middleware configuration for Next.js
 */
export const previewMiddlewareConfig = {
  matcher: [
    /*
     * Match preview-related paths:
     * - /preview/*
     * - /private/*
     * - Any path with preview=true query parameter
     * - API routes under /api/preview/*
     */
    '/preview/:path*',
    '/private/:path*',
    '/api/preview/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};