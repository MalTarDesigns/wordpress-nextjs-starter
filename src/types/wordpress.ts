import type { ContentNode } from '@/gql/graphql';

// Type guards for WordPress content types
export function isPage(contentNode: ContentNode): contentNode is ContentNode {
  return contentNode.nodeType === 'page';
}

export function isPost(contentNode: ContentNode): contentNode is ContentNode {
  return contentNode.nodeType === 'post';
}

// Webhook and Revalidation Types
export interface WebhookSecurityConfig {
  secretToken: string;
  allowedIPs?: string[];
  rateLimitMaxRequests?: number;
  rateLimitWindowMs?: number;
}

export interface RevalidationRequest {
  paths?: string[];
  tags?: string[];
  contentType?: 'post' | 'page' | 'custom' | 'all';
  contentId?: string | number;
  action?: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  priority?: 'high' | 'normal' | 'low';
  metadata?: Record<string, any>;
}

export interface RevalidationResponse {
  revalidated: boolean;
  now: number;
  paths?: string[];
  tags?: string[];
  errors?: string[];
  metadata?: {
    processingTimeMs?: number;
    requestId?: string;
    contentType?: string;
    action?: string;
    revalidatedCount?: number;
  };
}

export interface WebhookLogEntry {
  timestamp: number;
  requestId: string;
  ip: string;
  method: string;
  path: string;
  statusCode: number;
  processingTimeMs: number;
  contentType?: string;
  action?: string;
  pathsRevalidated: number;
  tagsRevalidated: number;
  errors: string[];
  userAgent?: string;
  payload?: Partial<RevalidationRequest>;
}

export interface WebhookError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}

export interface PathMappingRule {
  contentType: string;
  pattern: string;
  pathGenerator: (content: any) => string[];
  tags?: string[];
}

export interface RevalidationStrategy {
  immediate: PathMappingRule[];
  deferred: PathMappingRule[];
  cascade: PathMappingRule[];
}

// WordPress Content Update Payload
export interface WordPressUpdatePayload {
  post_id?: number;
  post_type?: string;
  post_status?: string;
  post_title?: string;
  post_slug?: string;
  post_parent?: number;
  taxonomy?: string;
  term_id?: number;
  action: string;
  user_id?: number;
  blog_id?: number;
  timestamp: number;
}

// Rate Limiting
export interface RateLimitRecord {
  count: number;
  lastReset: number;
  blocked: boolean;
  blockedUntil?: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs?: number;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (request: any) => string;
}