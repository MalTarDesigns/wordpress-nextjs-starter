import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from 'crypto';
import type { 
  RevalidationRequest, 
  RevalidationResponse, 
  WebhookSecurityConfig,
  WordPressUpdatePayload
} from "@/types/wordpress";
import { WebhookSecurity } from '@/lib/webhook/security';
import { WebhookLogger } from '@/lib/webhook/logger';
import { IntelligentRevalidator } from '@/lib/webhook/revalidation';

// Global instances (in production, use proper DI/singleton pattern)
let webhookSecurity: WebhookSecurity | null = null;
let webhookLogger: WebhookLogger | null = null;
let revalidator: IntelligentRevalidator | null = null;

// Initialize webhook components
function initializeWebhookComponents(): {
  security: WebhookSecurity;
  logger: WebhookLogger;
  revalidator: IntelligentRevalidator;
} {
  if (!webhookSecurity || !webhookLogger || !revalidator) {
    const config: WebhookSecurityConfig = {
      secretToken: process.env.HEADLESS_SECRET || '',
      allowedIPs: process.env.WEBHOOK_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || undefined,
      rateLimitMaxRequests: parseInt(process.env.WEBHOOK_RATE_LIMIT_MAX || '30', 10),
      rateLimitWindowMs: parseInt(process.env.WEBHOOK_RATE_LIMIT_WINDOW || '60000', 10),
    };

    webhookSecurity = new WebhookSecurity(config);
    webhookLogger = new WebhookLogger({
      maxEntries: parseInt(process.env.WEBHOOK_LOG_MAX_ENTRIES || '2000', 10),
      logLevel: (process.env.WEBHOOK_LOG_LEVEL as any) || 'info',
      includePayload: process.env.WEBHOOK_LOG_INCLUDE_PAYLOAD !== 'false',
    });
    revalidator = new IntelligentRevalidator();
  }

  return {
    security: webhookSecurity!,
    logger: webhookLogger!,
    revalidator: revalidator!,
  };
}

// Generate unique request ID
function generateRequestId(): string {
  return randomBytes(8).toString('hex');
}

// Enhanced validation for revalidation data
function validateRevalidationData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body: must be an object' };
  }
  
  const { paths, tags, contentType, contentId, action, priority, metadata } = data;
  
  // Validate paths
  if (paths !== undefined) {
    if (!Array.isArray(paths)) {
      return { valid: false, error: 'paths must be an array' };
    }
    if (!paths.every(path => typeof path === 'string' && path.startsWith('/'))) {
      return { valid: false, error: 'all paths must be strings starting with "/"' };
    }
    if (paths.length > 100) {
      return { valid: false, error: 'maximum 100 paths allowed per request' };
    }
  }
  
  // Validate tags
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      return { valid: false, error: 'tags must be an array' };
    }
    if (!tags.every(tag => typeof tag === 'string' && tag.length > 0)) {
      return { valid: false, error: 'all tags must be non-empty strings' };
    }
    if (tags.length > 50) {
      return { valid: false, error: 'maximum 50 tags allowed per request' };
    }
  }
  
  // Validate contentType
  if (contentType !== undefined) {
    const validContentTypes = ['post', 'page', 'custom', 'all'];
    if (!validContentTypes.includes(contentType)) {
      return { valid: false, error: `contentType must be one of: ${validContentTypes.join(', ')}` };
    }
  }
  
  // Validate action
  if (action !== undefined) {
    const validActions = ['create', 'update', 'delete', 'publish', 'unpublish'];
    if (!validActions.includes(action)) {
      return { valid: false, error: `action must be one of: ${validActions.join(', ')}` };
    }
  }
  
  // Validate priority
  if (priority !== undefined) {
    const validPriorities = ['high', 'normal', 'low'];
    if (!validPriorities.includes(priority)) {
      return { valid: false, error: `priority must be one of: ${validPriorities.join(', ')}` };
    }
  }
  
  // Validate contentId
  if (contentId !== undefined) {
    if (typeof contentId !== 'string' && typeof contentId !== 'number') {
      return { valid: false, error: 'contentId must be a string or number' };
    }
  }
  
  // Validate metadata
  if (metadata !== undefined) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return { valid: false, error: 'metadata must be an object' };
    }
  }
  
  return { valid: true };
}

// Enhanced revalidation handler with comprehensive security and intelligence
export async function PUT(request: NextRequest): Promise<NextResponse<RevalidationResponse>> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const { security, logger, revalidator } = initializeWebhookComponents();
  
  // Extract request metadata
  const clientIP = (request as any).ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const userAgent = request.headers.get('user-agent');
  
  try {
    // Security validation
    const securityResult = await security.validateRequest(request);
    if (!securityResult.valid) {
      const error = securityResult.error!;
      
      await logger.logRequest(
        requestId,
        { ip: clientIP, method: request.method, path: request.nextUrl.pathname, userAgent },
        { statusCode: error.statusCode, processingTimeMs: Date.now() - startTime },
        { errors: [error.message] }
      );
      
      return NextResponse.json(
        { 
          revalidated: false, 
          now: startTime,
          errors: [error.message],
          metadata: { requestId }
        }, 
        { 
          status: error.statusCode,
          headers: securityResult.retryAfter ? { 'Retry-After': securityResult.retryAfter.toString() } : {}
        }
      );
    }
    
    // Parse and validate request body
    const requestBody = await request.text();
    let revalidationData: RevalidationRequest;
    
    try {
      revalidationData = requestBody ? JSON.parse(requestBody) : { paths: [], tags: [] };
    } catch (parseError) {
      const errorMessage = "Invalid JSON format";
      
      await logger.logRequest(
        requestId,
        { ip: clientIP, method: request.method, path: request.nextUrl.pathname, userAgent },
        { statusCode: 400, processingTimeMs: Date.now() - startTime },
        { errors: [errorMessage] }
      );
      
      return NextResponse.json(
        { 
          revalidated: false, 
          now: startTime,
          errors: [errorMessage],
          metadata: { requestId }
        }, 
        { status: 400 }
      );
    }
    
    const validation = validateRevalidationData(revalidationData);
    if (!validation.valid) {
      const errorMessage = validation.error!;
      
      await logger.logRequest(
        requestId,
        { ip: clientIP, method: request.method, path: request.nextUrl.pathname, userAgent },
        { statusCode: 400, processingTimeMs: Date.now() - startTime },
        { errors: [errorMessage], payload: revalidationData }
      );
      
      return NextResponse.json(
        { 
          revalidated: false, 
          now: startTime,
          errors: [errorMessage],
          metadata: { requestId }
        }, 
        { status: 400 }
      );
    }
    
    // Use intelligent revalidator
    const revalidationResult = await revalidator.revalidateContent(revalidationData);
    
    // Record successful authentication and processing
    await security.recordSuccess(request);
    
    const revalidated = revalidationResult.pathsRevalidated.length > 0 || 
                       revalidationResult.tagsRevalidated.length > 0 ||
                       (revalidationData.paths?.length === 0 && revalidationData.tags?.length === 0);
    
    const processingTime = Date.now() - startTime;
    const statusCode = revalidationResult.errors.length > 0 ? 207 : 200; // 207 Multi-Status if partial success
    
    // Log the request
    await logger.logRequest(
      requestId,
      { ip: clientIP, method: request.method, path: request.nextUrl.pathname, userAgent },
      { statusCode, processingTimeMs: processingTime },
      {
        contentType: revalidationData.contentType,
        action: revalidationData.action,
        pathsRevalidated: revalidationResult.pathsRevalidated.length,
        tagsRevalidated: revalidationResult.tagsRevalidated.length,
        errors: revalidationResult.errors,
        payload: revalidationData,
      }
    );
    
    const response: RevalidationResponse = {
      revalidated,
      now: startTime,
      ...(revalidationResult.pathsRevalidated.length > 0 && { paths: revalidationResult.pathsRevalidated }),
      ...(revalidationResult.tagsRevalidated.length > 0 && { tags: revalidationResult.tagsRevalidated }),
      ...(revalidationResult.errors.length > 0 && { errors: revalidationResult.errors }),
      metadata: {
        processingTimeMs: processingTime,
        requestId,
        contentType: revalidationData.contentType,
        action: revalidationData.action,
        revalidatedCount: revalidationResult.pathsRevalidated.length + revalidationResult.tagsRevalidated.length,
      },
    };
    
    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'X-Processing-Time': processingTime.toString(),
        'X-Request-Id': requestId,
        'X-Revalidated-Count': (revalidationResult.pathsRevalidated.length + revalidationResult.tagsRevalidated.length).toString(),
      },
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log the error
    await logger.logRequest(
      requestId,
      { ip: clientIP, method: request.method, path: request.nextUrl.pathname, userAgent },
      { statusCode: 500, processingTimeMs: processingTime },
      { errors: [errorMessage] }
    );
    
    return NextResponse.json(
      { 
        revalidated: false, 
        now: startTime,
        errors: ["Internal server error during revalidation"],
        metadata: { requestId, processingTimeMs: processingTime }
      },
      { 
        status: 500,
        headers: {
          'X-Processing-Time': processingTime.toString(),
          'X-Request-Id': requestId,
        },
      }
    );
  }
}

// WordPress webhook endpoint for direct integration
export async function POST(request: NextRequest): Promise<NextResponse<RevalidationResponse>> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const { security, logger, revalidator } = initializeWebhookComponents();
  
  const clientIP = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const userAgent = request.headers.get('user-agent');
  
  try {
    // Security validation
    const securityResult = await security.validateRequest(request);
    if (!securityResult.valid) {
      const error = securityResult.error!;
      
      await logger.logRequest(
        requestId,
        { ip: clientIP, method: request.method, path: request.nextUrl.pathname, userAgent },
        { statusCode: error.statusCode, processingTimeMs: Date.now() - startTime },
        { errors: [error.message] }
      );
      
      return NextResponse.json(
        { 
          revalidated: false, 
          now: startTime,
          errors: [error.message],
          metadata: { requestId }
        }, 
        { status: error.statusCode }
      );
    }

    // Parse WordPress payload
    const requestBody = await request.text();
    let wordpressPayload: WordPressUpdatePayload;
    
    try {
      wordpressPayload = JSON.parse(requestBody);
    } catch (parseError) {
      const errorMessage = "Invalid JSON format";
      
      await logger.logRequest(
        requestId,
        { ip: clientIP, method: request.method, path: request.nextUrl.pathname, userAgent },
        { statusCode: 400, processingTimeMs: Date.now() - startTime },
        { errors: [errorMessage] }
      );
      
      return NextResponse.json(
        { 
          revalidated: false, 
          now: startTime,
          errors: [errorMessage],
          metadata: { requestId }
        }, 
        { status: 400 }
      );
    }

    // Process WordPress update
    const revalidationResult = await revalidator.revalidateFromWordPress(wordpressPayload);
    
    await security.recordSuccess(request);
    
    const processingTime = Date.now() - startTime;
    const statusCode = revalidationResult.errors.length > 0 ? 207 : 200;
    
    // Log the request
    await logger.logRequest(
      requestId,
      { ip: clientIP, method: request.method, path: request.nextUrl.pathname, userAgent },
      { statusCode, processingTimeMs: processingTime },
      {
        contentType: wordpressPayload.post_type,
        action: wordpressPayload.action,
        pathsRevalidated: revalidationResult.pathsRevalidated.length,
        tagsRevalidated: revalidationResult.tagsRevalidated.length,
        errors: revalidationResult.errors,
      }
    );
    
    const response: RevalidationResponse = {
      revalidated: revalidationResult.pathsRevalidated.length > 0 || revalidationResult.tagsRevalidated.length > 0,
      now: startTime,
      ...(revalidationResult.pathsRevalidated.length > 0 && { paths: revalidationResult.pathsRevalidated }),
      ...(revalidationResult.tagsRevalidated.length > 0 && { tags: revalidationResult.tagsRevalidated }),
      ...(revalidationResult.errors.length > 0 && { errors: revalidationResult.errors }),
      metadata: {
        processingTimeMs: processingTime,
        requestId,
        contentType: wordpressPayload.post_type,
        action: wordpressPayload.action,
        revalidatedCount: revalidationResult.pathsRevalidated.length + revalidationResult.tagsRevalidated.length,
      },
    };
    
    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'X-Processing-Time': processingTime.toString(),
        'X-Request-Id': requestId,
      },
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await logger.logRequest(
      requestId,
      { ip: clientIP, method: request.method, path: request.nextUrl.pathname, userAgent },
      { statusCode: 500, processingTimeMs: processingTime },
      { errors: [errorMessage] }
    );
    
    return NextResponse.json(
      { 
        revalidated: false, 
        now: startTime,
        errors: ["Internal server error"],
        metadata: { requestId }
      },
      { status: 500 }
    );
  }
}

// Health check and statistics endpoint
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { logger, security } = initializeWebhookComponents();
  
  // Check if this is a stats request
  const url = new URL(request.url);
  if (url.searchParams.has('stats')) {
    const secretKey = request.headers.get('X-Headless-Secret-Key');
    if (secretKey !== process.env.HEADLESS_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const stats = logger.getStatistics();
    const securityStats = security.getStats();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      stats: {
        ...stats,
        ...securityStats,
      },
    });
  }
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      PUT: '/api/revalidate - Manual revalidation with paths/tags',
      POST: '/api/revalidate - WordPress webhook integration',
      GET: '/api/revalidate - Health check (add ?stats=1 for statistics)',
    },
  });
}
