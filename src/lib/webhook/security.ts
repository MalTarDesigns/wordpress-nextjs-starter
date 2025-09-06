import { NextRequest } from 'next/server';
import type { 
  WebhookSecurityConfig, 
  RateLimitRecord, 
  RateLimitConfig, 
  WebhookError 
} from '@/types/wordpress';

// Create custom webhook error
export function createWebhookError(
  message: string, 
  code: string, 
  statusCode: number, 
  details?: Record<string, any>
): WebhookError {
  const error = new Error(message) as WebhookError;
  error.code = code;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

// Enhanced rate limiting with persistent storage and IP blocking
export class WebhookRateLimiter {
  private storage: Map<string, RateLimitRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: 60000, // 1 minute default
      maxRequests: 10, // 10 requests per minute default
      blockDurationMs: 900000, // 15 minutes block default
      skipSuccessfulRequests: false,
      ...config,
    };
    
    // Cleanup expired records every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  async checkLimit(request: NextRequest): Promise<{ allowed: boolean; retryAfter?: number }> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(request)
      : this.getDefaultKey(request);

    const now = Date.now();
    const record = this.storage.get(key) || {
      count: 0,
      lastReset: now,
      blocked: false,
    };

    // Check if currently blocked
    if (record.blocked && record.blockedUntil && now < record.blockedUntil) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil((record.blockedUntil - now) / 1000) 
      };
    }

    // Reset window if expired
    if (now - record.lastReset > this.config.windowMs) {
      record.count = 0;
      record.lastReset = now;
      record.blocked = false;
      record.blockedUntil = undefined;
    }

    // Check if limit exceeded
    if (record.count >= this.config.maxRequests) {
      record.blocked = true;
      record.blockedUntil = now + (this.config.blockDurationMs || 900000);
      this.storage.set(key, record);
      
      return { 
        allowed: false, 
        retryAfter: Math.ceil((this.config.blockDurationMs || 900000) / 1000) 
      };
    }

    // Increment counter
    record.count++;
    this.storage.set(key, record);

    return { allowed: true };
  }

  async recordSuccess(request: NextRequest): Promise<void> {
    if (this.config.skipSuccessfulRequests) {
      const key = this.config.keyGenerator 
        ? this.config.keyGenerator(request)
        : this.getDefaultKey(request);
      
      const record = this.storage.get(key);
      if (record && record.count > 0) {
        record.count--;
        this.storage.set(key, record);
      }
    }
  }

  private getDefaultKey(request: NextRequest): string {
    return request.ip || 
           request.headers.get('x-forwarded-for')?.split(',')[0] || 
           request.headers.get('x-real-ip') || 
           'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.storage) {
      if (now - record.lastReset > this.config.windowMs * 2) {
        this.storage.delete(key);
      }
    }
  }

  getStats(): { totalRecords: number; blockedIPs: number } {
    const now = Date.now();
    let blockedCount = 0;
    
    for (const record of this.storage.values()) {
      if (record.blocked && record.blockedUntil && now < record.blockedUntil) {
        blockedCount++;
      }
    }
    
    return {
      totalRecords: this.storage.size,
      blockedIPs: blockedCount,
    };
  }
}

// Security validator for webhook requests
export class WebhookSecurity {
  private config: WebhookSecurityConfig;
  private rateLimiter: WebhookRateLimiter;

  constructor(config: WebhookSecurityConfig) {
    this.config = config;
    this.rateLimiter = new WebhookRateLimiter({
      windowMs: config.rateLimitWindowMs || 60000,
      maxRequests: config.rateLimitMaxRequests || 10,
    });
  }

  async validateRequest(request: NextRequest): Promise<{
    valid: boolean;
    error?: WebhookError;
    retryAfter?: number;
  }> {
    try {
      // Check authentication token
      const authResult = this.validateAuth(request);
      if (!authResult.valid) {
        return { valid: false, error: authResult.error };
      }

      // Check IP whitelist
      const ipResult = this.validateIP(request);
      if (!ipResult.valid) {
        return { valid: false, error: ipResult.error };
      }

      // Check rate limits
      const rateLimitResult = await this.rateLimiter.checkLimit(request);
      if (!rateLimitResult.allowed) {
        return { 
          valid: false, 
          error: createWebhookError(
            'Rate limit exceeded',
            'RATE_LIMIT_EXCEEDED',
            429,
            { retryAfter: rateLimitResult.retryAfter }
          ),
          retryAfter: rateLimitResult.retryAfter
        };
      }

      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: createWebhookError(
          'Security validation failed',
          'SECURITY_VALIDATION_ERROR',
          500,
          { originalError: error instanceof Error ? error.message : String(error) }
        )
      };
    }
  }

  async recordSuccess(request: NextRequest): Promise<void> {
    await this.rateLimiter.recordSuccess(request);
  }

  private validateAuth(request: NextRequest): { valid: boolean; error?: WebhookError } {
    const secretToken = request.headers.get('X-Headless-Secret-Key') ||
                       request.headers.get('X-Webhook-Secret') ||
                       request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!secretToken) {
      return {
        valid: false,
        error: createWebhookError(
          'Missing authentication token',
          'MISSING_AUTH_TOKEN',
          401
        )
      };
    }

    if (secretToken !== this.config.secretToken) {
      return {
        valid: false,
        error: createWebhookError(
          'Invalid authentication token',
          'INVALID_AUTH_TOKEN',
          401
        )
      };
    }

    return { valid: true };
  }

  private validateIP(request: NextRequest): { valid: boolean; error?: WebhookError } {
    if (!this.config.allowedIPs || this.config.allowedIPs.length === 0) {
      return { valid: true }; // No IP restrictions
    }

    const clientIP = request.ip || 
                    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    if (clientIP === 'unknown') {
      return {
        valid: false,
        error: createWebhookError(
          'Cannot determine client IP',
          'UNKNOWN_CLIENT_IP',
          403
        )
      };
    }

    // Check if IP is in allowed list
    const isAllowed = this.config.allowedIPs.some(allowedIP => {
      if (allowedIP.includes('/')) {
        // CIDR notation support (basic implementation)
        return this.isIPInCIDR(clientIP, allowedIP);
      }
      return clientIP === allowedIP;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: createWebhookError(
          `IP address ${clientIP} not allowed`,
          'IP_NOT_ALLOWED',
          403,
          { clientIP, allowedIPs: this.config.allowedIPs }
        )
      };
    }

    return { valid: true };
  }

  private isIPInCIDR(ip: string, cidr: string): boolean {
    // Basic CIDR check - in production, use a proper IP library
    const [network, prefixLength] = cidr.split('/');
    if (!prefixLength) return ip === network;
    
    // This is a simplified implementation
    // In production, use libraries like 'ip-range-check' or 'netmask'
    try {
      const ipParts = ip.split('.').map(Number);
      const networkParts = network.split('.').map(Number);
      const prefix = parseInt(prefixLength, 10);
      
      if (prefix === 24) {
        return ipParts[0] === networkParts[0] && 
               ipParts[1] === networkParts[1] && 
               ipParts[2] === networkParts[2];
      }
      
      // Add more CIDR logic as needed
      return false;
    } catch {
      return false;
    }
  }

  getStats() {
    return this.rateLimiter.getStats();
  }
}