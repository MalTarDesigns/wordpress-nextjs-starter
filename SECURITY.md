# Security Policy

This document outlines the security measures, best practices, and vulnerability reporting process for the WordPress Next.js Starter template.

## Table of Contents

1. [Supported Versions](#supported-versions)
2. [Security Features](#security-features)
3. [Vulnerability Reporting](#vulnerability-reporting)
4. [Security Best Practices](#security-best-practices)
5. [Environment Security](#environment-security)
6. [WordPress Security](#wordpress-security)
7. [Next.js Security](#nextjs-security)
8. [API Security](#api-security)
9. [Content Security](#content-security)
10. [Monitoring and Auditing](#monitoring-and-auditing)

## Supported Versions

Security updates and patches are provided for the following versions:

| Version | Supported          | End of Life |
| ------- | ------------------ | ----------- |
| 1.x.x   | ✅ Active support  | TBD         |
| 0.x.x   | ❌ No longer supported | 2024-01-01 |

## Security Features

### Built-in Security Measures

#### HTTP Security Headers
The template includes comprehensive security headers via Vercel configuration:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

#### Content Security Policy (CSP)
Configurable CSP headers to prevent XSS attacks:

```typescript
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;
```

#### Rate Limiting
Multi-layer rate limiting protection:

- **API endpoints**: 100 requests per hour per IP
- **Webhook endpoints**: 30 requests per minute per IP  
- **Search endpoints**: 60 requests per hour per IP
- **Contact forms**: 5 submissions per hour per IP

#### Authentication & Authorization
Secure token-based authentication:

- **Webhook secrets**: 64-character cryptographically secure tokens
- **Preview mode**: Separate secret tokens for draft content access
- **WordPress integration**: Application Password authentication
- **API keys**: Scoped access with configurable permissions

### Input Validation & Sanitization

#### GraphQL Query Validation
```typescript
function validateGraphQLQuery(query: string): boolean {
  // Prevent deeply nested queries (DoS protection)
  const depthLimit = 10;
  const depth = (query.match(/{/g) || []).length;
  
  if (depth > depthLimit) {
    throw new Error('Query too complex');
  }
  
  // Prevent introspection in production
  if (process.env.NODE_ENV === 'production' && query.includes('__schema')) {
    throw new Error('Introspection disabled');
  }
  
  return true;
}
```

#### Content Sanitization
```typescript
function sanitizeContent(content: string): string {
  // Remove potentially dangerous HTML
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOWED_URI_REGEXP: /^https?:\/\//,
  });
}
```

#### Environment Variable Validation
```typescript
const envSchema = z.object({
  NEXT_PUBLIC_WORDPRESS_API_URL: z.string().url(),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  HEADLESS_SECRET: z.string().min(32, 'Secret must be at least 32 characters'),
  WORDPRESS_PREVIEW_SECRET: z.string().min(16).optional(),
});

export function validateEnvironment() {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}
```

## Vulnerability Reporting

### Reporting Security Issues

**DO NOT** report security vulnerabilities through public GitHub issues.

Instead, please report security vulnerabilities to: **security@yourproject.com**

### Reporting Process

1. **Email**: Send details to the security email
2. **Subject**: Include "SECURITY" and brief description
3. **Details**: Provide detailed information including:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information

### Response Timeline

- **Initial Response**: Within 24 hours
- **Confirmation**: Within 48 hours  
- **Resolution**: Within 7-30 days depending on severity
- **Disclosure**: Coordinated disclosure after fix is deployed

### Severity Classification

#### Critical (CVSS 9.0-10.0)
- Remote code execution
- SQL injection
- Authentication bypass
- Data breach potential

#### High (CVSS 7.0-8.9)
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Privilege escalation
- Sensitive data exposure

#### Medium (CVSS 4.0-6.9)
- Information disclosure
- Denial of service
- Security misconfiguration

#### Low (CVSS 0.1-3.9)
- Minor information leaks
- Best practice violations

## Security Best Practices

### Development Security

#### Secure Coding Practices
```typescript
// ✅ Good - Input validation
function processUserInput(input: string): string {
  if (typeof input !== 'string' || input.length > 1000) {
    throw new Error('Invalid input');
  }
  return input.trim().substring(0, 500);
}

// ✅ Good - SQL injection prevention (if using database)
const query = 'SELECT * FROM posts WHERE id = $1';
const result = await db.query(query, [postId]);

// ❌ Bad - No validation
function badFunction(input: any) {
  return eval(input); // Never use eval
}
```

#### Secret Management
```typescript
// ✅ Good - Environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY environment variable required');
}

// ❌ Bad - Hardcoded secrets
const apiKey = 'abc123'; // Never hardcode secrets
```

#### Error Handling
```typescript
// ✅ Good - Safe error responses
try {
  const data = await fetchSensitiveData();
  return { success: true, data };
} catch (error) {
  console.error('Internal error:', error); // Log detailed error
  return { 
    success: false, 
    error: 'An error occurred' // Generic user-facing message
  };
}
```

### Production Security

#### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Security headers
HSTS_MAX_AGE=31536000
CONTENT_SECURITY_POLICY=strict

# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=3600000

# Logging
LOG_LEVEL=warn
LOG_SENSITIVE_DATA=false
```

#### SSL/TLS Configuration
- **Minimum TLS version**: 1.2
- **Certificate management**: Automated via Vercel
- **HSTS enabled**: Force HTTPS connections
- **Secure cookies**: All cookies marked secure in production

## Environment Security

### Environment Variable Security

#### Required Security Measures
```bash
# Secrets should be generated cryptographically
HEADLESS_SECRET=$(openssl rand -hex 32)
WORDPRESS_PREVIEW_SECRET=$(openssl rand -hex 16)

# Database URLs should use SSL
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# API URLs should use HTTPS
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wp-site.com/graphql
```

#### Environment Separation
- **Development**: `.env.local` (not committed)
- **Staging**: Platform environment variables
- **Production**: Platform environment variables with additional security

#### Secret Rotation
Regular rotation schedule:
- **API keys**: Every 90 days
- **Webhook secrets**: Every 180 days
- **Database passwords**: Every 365 days

### Development Security

#### Local Development
```bash
# Use HTTPS in development
pnpm dev --experimental-https

# Environment validation
pnpm validate-env

# Security audit
npm audit --audit-level high
```

#### Code Review Checklist
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on all user inputs
- [ ] Output encoding for all dynamic content
- [ ] Authentication/authorization checks
- [ ] Error handling doesn't leak sensitive information
- [ ] Rate limiting applied to API endpoints
- [ ] HTTPS used for all external requests

## WordPress Security

### WordPress Hardening

#### Security Plugins
Recommended WordPress security plugins:
- **Wordfence Security**: Firewall and malware scanner
- **iThemes Security**: Comprehensive security suite
- **All In One WP Security**: Security hardening tools

#### WordPress Configuration
```php
// wp-config.php security settings
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);
define('AUTOMATIC_UPDATER_DISABLED', false);
define('WP_AUTO_UPDATE_CORE', true);

// Force SSL for admin
define('FORCE_SSL_ADMIN', true);

// Security keys (use unique values)
define('AUTH_KEY',         'your-unique-phrase');
define('SECURE_AUTH_KEY',  'your-unique-phrase');
define('LOGGED_IN_KEY',    'your-unique-phrase');
define('NONCE_KEY',        'your-unique-phrase');
// ... etc
```

#### User Security
```php
// Limit login attempts
function limit_login_attempts() {
    $attempts = get_transient('login_attempts_' . $_SERVER['REMOTE_ADDR']);
    if ($attempts >= 5) {
        wp_die('Too many failed login attempts. Try again later.');
    }
}

// Strong password policy
function enforce_strong_passwords($errors, $sanitized_user_login, $user_email) {
    if (isset($_POST['pass1']) && strlen($_POST['pass1']) < 12) {
        $errors->add('password_length', 'Password must be at least 12 characters long.');
    }
}
add_action('user_profile_update_errors', 'enforce_strong_passwords', 0, 3);
```

### GraphQL Security

#### Query Complexity Limiting
```php
// Limit GraphQL query depth
add_filter('graphql_query_depth_max', function() {
    return 10; // Maximum depth
});

// Disable introspection in production
add_filter('graphql_introspection_enabled', function() {
    return WP_DEBUG; // Only in development
});
```

#### Field Authorization
```php
// Restrict sensitive fields
add_filter('graphql_connection_resolve', function($connection, $resolver, $root, $args, $context, $info) {
    // Check user permissions
    if (!current_user_can('edit_posts') && $info->fieldName === 'posts') {
        // Return only published posts for non-editors
        $args['where']['status'] = 'publish';
    }
    return $connection;
}, 10, 6);
```

## Next.js Security

### Framework Security

#### Middleware Security
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Rate limiting
  const ip = request.ip ?? 'anonymous';
  // Implement rate limiting logic
  
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*']
};
```

#### API Route Security
```typescript
// API route with security measures
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    await checkRateLimit(request);
    
    // Authentication
    const token = request.headers.get('authorization');
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Input validation
    const body = await request.json();
    const validatedData = schema.parse(body);
    
    // Process request
    const result = await processRequest(validatedData);
    
    return NextResponse.json(result);
  } catch (error) {
    // Log error without exposing details
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

### Client-Side Security

#### XSS Prevention
```typescript
// Safe HTML rendering
function SafeHTML({ content }: { content: string }) {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}

// Content Security Policy
const CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' fonts.gstatic.com;
`;
```

## API Security

### Authentication

#### Token-Based Authentication
```typescript
interface AuthToken {
  iss: string;        // Issuer
  aud: string;        // Audience
  exp: number;        // Expiration
  iat: number;        // Issued at
  sub: string;        // Subject
  scope: string[];    // Permissions
}

function verifyToken(token: string): AuthToken | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthToken;
    
    // Check expiration
    if (decoded.exp < Date.now() / 1000) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}
```

#### API Key Management
```typescript
interface APIKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  lastUsed: Date;
  created: Date;
  expires?: Date;
}

function validateAPIKey(key: string): APIKey | null {
  // Hash the key for comparison
  const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
  
  // Look up in database/cache
  const apiKey = getAPIKeyByHash(hashedKey);
  
  if (!apiKey || (apiKey.expires && apiKey.expires < new Date())) {
    return null;
  }
  
  // Update last used
  updateAPIKeyLastUsed(apiKey.id);
  
  return apiKey;
}
```

### Rate Limiting Implementation

```typescript
class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  constructor(
    private windowMs: number = 60000,
    private max: number = 100
  ) {}
  
  async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const record = this.store.get(key);
    
    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: this.max - 1, resetTime };
    }
    
    if (record.count >= this.max) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }
    
    record.count++;
    this.store.set(key, record);
    
    return { 
      allowed: true, 
      remaining: this.max - record.count, 
      resetTime: record.resetTime 
    };
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}
```

## Content Security

### WordPress Content Sanitization

```typescript
function sanitizeWordPressContent(content: string): string {
  // Remove WordPress shortcodes that could be dangerous
  content = content.replace(/\[([a-zA-Z_]+)([^\]]*)\]/g, (match, shortcode, attrs) => {
    const allowedShortcodes = ['gallery', 'caption', 'embed'];
    return allowedShortcodes.includes(shortcode) ? match : '';
  });
  
  // Sanitize HTML
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
    ALLOWED_URI_REGEXP: /^https?:\/\//,
  });
}
```

### Image Security

```typescript
function validateImageUpload(file: File): boolean {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return false;
  }
  
  // Additional checks could include:
  // - File signature validation
  // - Malware scanning
  // - Metadata stripping
  
  return true;
}
```

## Monitoring and Auditing

### Security Logging

```typescript
interface SecurityEvent {
  timestamp: Date;
  type: 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent: string;
  details: Record<string, any>;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  
  log(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };
    
    this.events.push(securityEvent);
    
    // Send to external logging service
    if (event.severity === 'critical' || event.severity === 'high') {
      this.alertSecurity(securityEvent);
    }
  }
  
  private async alertSecurity(event: SecurityEvent): Promise<void> {
    // Send alert to security team
    try {
      await fetch(process.env.SECURITY_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }
}
```

### Security Auditing

#### Automated Security Checks
```bash
# Package vulnerability scanning
npm audit --audit-level high

# License compliance
npx license-checker

# Code quality and security
npx eslint . --ext .ts,.tsx
npx tsc --noEmit

# Dependency analysis
npx depcheck
```

#### Manual Security Review
Regular security review checklist:
- [ ] Review access logs for suspicious activity
- [ ] Audit user permissions and roles
- [ ] Check for outdated dependencies
- [ ] Verify SSL/TLS configuration
- [ ] Review API endpoint security
- [ ] Validate environment variable security
- [ ] Check backup and recovery procedures

### Incident Response

#### Response Plan
1. **Detection**: Monitor alerts and logs
2. **Assessment**: Evaluate severity and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threats and vulnerabilities
5. **Recovery**: Restore services and monitor
6. **Lessons Learned**: Document and improve

#### Emergency Contacts
- **Development Team**: dev-team@yourproject.com
- **Security Team**: security@yourproject.com  
- **Infrastructure Team**: ops@yourproject.com
- **Management**: management@yourproject.com

## Security Updates

### Staying Secure

#### Regular Updates
- **Dependencies**: Monthly security updates
- **WordPress**: Keep core, plugins, and themes updated
- **Node.js**: Follow LTS releases
- **Next.js**: Update within 30 days of security releases

#### Security Monitoring
Subscribe to security advisories:
- [GitHub Security Advisories](https://github.com/advisories)
- [WordPress Security](https://wordpress.org/news/category/security/)
- [Next.js Security](https://nextjs.org/blog)
- [Vercel Security](https://vercel.com/changelog)

#### Security Testing
Regular security testing schedule:
- **Dependency scanning**: Weekly
- **SAST (Static Analysis)**: On every commit
- **DAST (Dynamic Analysis)**: Monthly
- **Penetration testing**: Quarterly
- **Security audit**: Annually

This security policy ensures the WordPress Next.js Starter template maintains high security standards throughout its lifecycle. Regular reviews and updates to this policy help address emerging threats and maintain protection against evolving security risks.