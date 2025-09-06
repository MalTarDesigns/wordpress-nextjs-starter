/**
 * Preview Validation and Security Utilities
 * Comprehensive validation and security functions for preview mode
 */

import { NextRequest } from "next/server";
import { validateJWTToken, getUserRoles } from "@/lib/auth/wordpress";
import { getJWTTokenFromCookies, getPreviewStateFromCookies, PreviewState } from "@/lib/preview/cookies";
import { envConfig, isDevelopment } from "@/lib/env";

// Content access levels
export enum ContentAccessLevel {
  PUBLIC = "public",
  DRAFT = "draft",
  PRIVATE = "private",
  PENDING = "pending"
}

// Preview validation result interface
export interface PreviewValidationResult {
  isValid: boolean;
  isExpired: boolean;
  hasValidToken: boolean;
  hasValidSession: boolean;
  userCanAccess: boolean;
  accessLevel: ContentAccessLevel;
  userId?: string;
  username?: string;
  userRoles: string[];
  error?: string;
  warnings: string[];
}

// Content permission interface
export interface ContentPermissions {
  canView: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canDelete: boolean;
  requiresAuth: boolean;
  accessLevel: ContentAccessLevel;
}

// Security check result interface
export interface SecurityCheckResult {
  passed: boolean;
  blocked: boolean;
  riskLevel: "low" | "medium" | "high";
  issues: string[];
  clientInfo: {
    ip: string;
    userAgent: string;
    referer?: string;
  };
}

/**
 * Comprehensive preview validation
 */
export async function validatePreviewAccess(
  request: NextRequest,
  contentId?: string,
  contentStatus?: string
): Promise<PreviewValidationResult> {
  const warnings: string[] = [];
  let isValid = false;
  let isExpired = false;
  let hasValidToken = false;
  let hasValidSession = false;
  let userCanAccess = false;
  let userId: string | undefined;
  let username: string | undefined;
  let userRoles: string[] = [];
  let error: string | undefined;

  try {
    // 1. Get JWT token from cookies
    const jwtToken = getJWTTokenFromCookies(request);
    if (!jwtToken) {
      return {
        isValid: false,
        isExpired: false,
        hasValidToken: false,
        hasValidSession: false,
        userCanAccess: false,
        accessLevel: ContentAccessLevel.PUBLIC,
        userRoles: [],
        error: "No authentication token found",
        warnings,
      };
    }

    // 2. Validate JWT token
    const tokenValidation = await validateJWTToken(jwtToken);
    hasValidToken = tokenValidation.isValid;
    
    if (!hasValidToken) {
      isExpired = tokenValidation.isExpired || false;
      error = tokenValidation.error;
      
      return {
        isValid: false,
        isExpired,
        hasValidToken: false,
        hasValidSession: false,
        userCanAccess: false,
        accessLevel: ContentAccessLevel.PUBLIC,
        userRoles: [],
        error: error || "Invalid authentication token",
        warnings,
      };
    }

    userId = tokenValidation.userId;
    username = tokenValidation.username;

    // 3. Check preview session
    const previewState = getPreviewStateFromCookies(request);
    hasValidSession = !!previewState?.isActive;

    if (!hasValidSession) {
      warnings.push("No active preview session found");
    } else if (isPreviewSessionExpired(previewState!)) {
      isExpired = true;
      warnings.push("Preview session has expired");
    }

    // 4. Get user roles and permissions
    try {
      const roles = await getUserRoles(jwtToken);
      userRoles = roles.roles;
      
      // Determine user access level
      const contentAccessLevel = getContentAccessLevel(contentStatus);
      userCanAccess = canUserAccessContent(roles, contentAccessLevel);
      
      if (!userCanAccess) {
        error = `User lacks permission to access ${contentAccessLevel} content`;
      }
      
    } catch (roleError) {
      warnings.push("Could not verify user permissions");
      userCanAccess = false;
    }

    // 5. Overall validation
    isValid = hasValidToken && hasValidSession && !isExpired && userCanAccess;

    return {
      isValid,
      isExpired,
      hasValidToken,
      hasValidSession,
      userCanAccess,
      accessLevel: getContentAccessLevel(contentStatus),
      userId,
      username,
      userRoles,
      error,
      warnings,
    };

  } catch (validationError) {
    console.error("Preview validation error:", validationError);
    return {
      isValid: false,
      isExpired: false,
      hasValidToken: false,
      hasValidSession: false,
      userCanAccess: false,
      accessLevel: ContentAccessLevel.PUBLIC,
      userRoles: [],
      error: "Validation failed due to server error",
      warnings,
    };
  }
}

/**
 * Check if preview session is expired
 */
export function isPreviewSessionExpired(
  previewState: PreviewState,
  maxInactiveMinutes: number = 30
): boolean {
  if (!previewState.lastActivity) {
    return true; // No activity recorded
  }

  const now = Date.now();
  const maxInactiveMs = maxInactiveMinutes * 60 * 1000;
  const timeSinceActivity = now - previewState.lastActivity;

  return timeSinceActivity > maxInactiveMs;
}

/**
 * Get content access level from status
 */
export function getContentAccessLevel(contentStatus?: string): ContentAccessLevel {
  switch (contentStatus?.toLowerCase()) {
    case "draft":
      return ContentAccessLevel.DRAFT;
    case "private":
      return ContentAccessLevel.PRIVATE;
    case "pending":
      return ContentAccessLevel.PENDING;
    case "publish":
    case "published":
    default:
      return ContentAccessLevel.PUBLIC;
  }
}

/**
 * Check if user can access content based on their roles
 */
export function canUserAccessContent(
  userRoles: { canEdit: boolean; canPublish: boolean; canViewPrivate: boolean; roles: string[] },
  accessLevel: ContentAccessLevel
): boolean {
  switch (accessLevel) {
    case ContentAccessLevel.PUBLIC:
      return true; // Anyone can access public content in preview
    
    case ContentAccessLevel.DRAFT:
    case ContentAccessLevel.PENDING:
      return userRoles.canEdit; // Need edit permissions for drafts
    
    case ContentAccessLevel.PRIVATE:
      return userRoles.canViewPrivate; // Need private view permissions
    
    default:
      return false;
  }
}

/**
 * Get content permissions based on user roles and content type
 */
export function getContentPermissions(
  userRoles: { canEdit: boolean; canPublish: boolean; canViewPrivate: boolean; roles: string[] },
  accessLevel: ContentAccessLevel
): ContentPermissions {
  const basePermissions: ContentPermissions = {
    canView: false,
    canEdit: false,
    canPublish: false,
    canDelete: false,
    requiresAuth: true,
    accessLevel,
  };

  // Check view permission
  basePermissions.canView = canUserAccessContent(userRoles, accessLevel);

  // Edit permissions
  basePermissions.canEdit = userRoles.canEdit && 
    (accessLevel === ContentAccessLevel.DRAFT || 
     accessLevel === ContentAccessLevel.PENDING);

  // Publish permissions
  basePermissions.canPublish = userRoles.canPublish && userRoles.canEdit;

  // Delete permissions (typically for administrators only)
  basePermissions.canDelete = userRoles.roles.includes("administrator");

  return basePermissions;
}

/**
 * Perform security checks on preview requests
 */
export function performSecurityCheck(request: NextRequest): SecurityCheckResult {
  const issues: string[] = [];
  let riskLevel: "low" | "medium" | "high" = "low";
  let blocked = false;

  // Get client information
  const clientInfo = {
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    referer: request.headers.get('referer') || undefined,
  };

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawl/i,
    /spider/i,
    /scrape/i,
    /hack/i,
    /exploit/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(clientInfo.userAgent))) {
    issues.push("Suspicious user agent detected");
    riskLevel = "medium";
  }

  // Check for missing referer on preview requests (potential direct access)
  if (!clientInfo.referer && !isDevelopment()) {
    issues.push("Direct preview access without referer");
    riskLevel = "medium";
  }

  // Check for localhost/development patterns in production
  if (!isDevelopment() && clientInfo.referer?.includes('localhost')) {
    issues.push("Development referer in production");
    riskLevel = "high";
    blocked = true;
  }

  // Check IP for known patterns (basic check)
  if (clientInfo.ip === 'unknown') {
    issues.push("Unable to determine client IP");
    riskLevel = riskLevel === "high" ? "high" : "medium";
  }

  // Check for rapid requests (basic protection)
  const hasRateLimitHeaders = request.headers.get('x-ratelimit-remaining');
  if (hasRateLimitHeaders && parseInt(hasRateLimitHeaders) < 5) {
    issues.push("Rate limit nearly exceeded");
    riskLevel = "medium";
  }

  return {
    passed: !blocked && riskLevel !== "high",
    blocked,
    riskLevel,
    issues,
    clientInfo,
  };
}

/**
 * Validate preview URL structure and parameters
 */
export function validatePreviewUrl(url: string): {
  isValid: boolean;
  contentId?: string;
  contentType?: string;
  errors: string[];
} {
  const errors: string[] = [];
  let isValid = true;
  let contentId: string | undefined;
  let contentType: string | undefined;

  try {
    const urlObj = new URL(url);
    
    // Check if it's a preview URL
    const isPreviewPath = urlObj.pathname.includes('/preview/') || 
                         urlObj.pathname.includes('/private/');
    
    if (!isPreviewPath) {
      errors.push("URL does not appear to be a preview URL");
      isValid = false;
    }

    // Extract content ID from path
    const pathMatch = urlObj.pathname.match(/\/(preview|private)\/(\d+)/);
    if (pathMatch) {
      contentId = pathMatch[2];
      contentType = urlObj.searchParams.get('type') || undefined;
    } else if (isPreviewPath) {
      errors.push("Could not extract content ID from preview URL");
      isValid = false;
    }

    // Validate required parameters
    if (!urlObj.searchParams.get('preview')) {
      errors.push("Missing preview parameter");
      isValid = false;
    }

    // Check for suspicious parameters
    const suspiciousParams = ['<script', 'javascript:', 'data:', 'vbscript:'];
    urlObj.searchParams.forEach((value, key) => {
      if (suspiciousParams.some(pattern => value.includes(pattern))) {
        errors.push(`Suspicious parameter detected: ${key}`);
        isValid = false;
      }
    });

  } catch (error) {
    errors.push("Invalid URL format");
    isValid = false;
  }

  return {
    isValid,
    contentId,
    contentType,
    errors,
  };
}

/**
 * Log security events for monitoring
 */
export function logSecurityEvent(
  event: "preview_access" | "token_validation" | "permission_denied" | "session_expired" | "security_violation",
  details: {
    ip?: string;
    userId?: string;
    contentId?: string;
    reason?: string;
    riskLevel?: string;
    userAgent?: string;
  }
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
    environment: isDevelopment() ? "development" : "production",
  };

  // In production, this should be sent to a proper logging service
  if (isDevelopment()) {
    console.log("Security Event:", logEntry);
  } else {
    // TODO: Implement proper security logging
    console.warn("Security Event:", logEntry);
  }
}

/**
 * Create a security report for preview requests
 */
export function createSecurityReport(
  validation: PreviewValidationResult,
  securityCheck: SecurityCheckResult,
  contentId?: string
): {
  overall: "safe" | "warning" | "danger";
  recommendations: string[];
  blockers: string[];
} {
  const recommendations: string[] = [];
  const blockers: string[] = [];
  let overall: "safe" | "warning" | "danger" = "safe";

  // Check validation results
  if (!validation.isValid) {
    overall = "danger";
    blockers.push("Preview access validation failed");
  }

  if (validation.isExpired) {
    overall = overall === "danger" ? "danger" : "warning";
    recommendations.push("Session expired, consider refreshing authentication");
  }

  if (!validation.hasValidToken) {
    overall = "danger";
    blockers.push("Invalid authentication token");
  }

  // Check security results
  if (securityCheck.blocked) {
    overall = "danger";
    blockers.push("Request blocked due to security concerns");
  }

  if (securityCheck.riskLevel === "high") {
    overall = "danger";
    blockers.push("High security risk detected");
  } else if (securityCheck.riskLevel === "medium") {
    overall = overall === "danger" ? "danger" : "warning";
    recommendations.push("Medium security risk, monitor closely");
  }

  // Add security recommendations
  if (securityCheck.issues.length > 0) {
    recommendations.push(...securityCheck.issues.map(issue => `Security: ${issue}`));
  }

  if (validation.warnings.length > 0) {
    recommendations.push(...validation.warnings);
  }

  return {
    overall,
    recommendations,
    blockers,
  };
}