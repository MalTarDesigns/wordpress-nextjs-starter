# API Documentation

This document provides comprehensive documentation for the WordPress Next.js starter template's API routes, hooks, utilities, and component interfaces.

## Table of Contents

1. [API Routes](#api-routes)
2. [GraphQL Queries](#graphql-queries)
3. [Custom Hooks](#custom-hooks)
4. [Utility Functions](#utility-functions)
5. [Component APIs](#component-apis)
6. [TypeScript Interfaces](#typescript-interfaces)
7. [Environment Variables](#environment-variables)
8. [Webhook System](#webhook-system)

## API Routes

### Revalidation API (`/api/revalidate`)

Handles content revalidation requests from WordPress webhooks.

#### POST `/api/revalidate`

**Purpose**: Revalidate Next.js pages when WordPress content changes

**Headers**:
```
X-Headless-Secret-Key: string (required)
Content-Type: application/json
```

**Request Body**:
```typescript
interface RevalidationRequest {
  // WordPress webhook data
  post_id?: number;
  post_type?: string;
  post_status?: string;
  action?: string;
  
  // Manual revalidation data
  paths?: string[];
  tags?: string[];
  contentType?: 'post' | 'page' | 'custom' | 'all';
  contentId?: string | number;
  priority?: 'high' | 'normal' | 'low';
}
```

**Response**:
```typescript
interface RevalidationResponse {
  success: boolean;
  message: string;
  revalidated?: {
    paths: string[];
    tags: string[];
  };
  errors?: string[];
}
```

**Example**:
```bash
curl -X POST https://yoursite.com/api/revalidate \
  -H "X-Headless-Secret-Key: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 123,
    "post_type": "post",
    "action": "save_post"
  }'
```

#### GET `/api/revalidate`

**Purpose**: Health check and statistics

**Query Parameters**:
- `stats=1` - Include statistics (requires authentication)

**Response**:
```typescript
interface HealthResponse {
  status: 'ok';
  timestamp: string;
  stats?: {
    totalRequests: number;
    successfulRequests: number;
    errorRequests: number;
    averageProcessingTime: number;
  };
}
```

### Preview API (`/api/preview`)

Enables WordPress preview mode for draft content.

#### GET `/api/preview`

**Purpose**: Enable preview mode for draft content

**Query Parameters**:
- `secret: string` - Preview secret token
- `id: number` - WordPress post/page ID
- `slug: string` - Content slug
- `wpnonce: string` - WordPress nonce

**Response**: Redirects to preview page with preview mode enabled

**Example**:
```bash
curl "https://yoursite.com/api/preview?secret=your-secret&id=123&slug=draft-post"
```

### Exit Preview API (`/api/exit-preview`)

#### POST `/api/exit-preview`

**Purpose**: Disable preview mode

**Response**: Redirects to homepage with preview mode disabled

### Webhook Admin API (`/api/webhook/admin`)

Administrative interface for webhook management.

#### GET `/api/webhook/admin`

**Purpose**: Get webhook configuration and logs

**Headers**:
```
X-Headless-Secret-Key: string (required)
```

**Query Parameters**:
- `action: 'config' | 'logs' | 'stats'`
- `limit: number` - For logs (default: 50)
- `offset: number` - For pagination

**Response**:
```typescript
interface AdminResponse {
  config?: WebhookConfig;
  logs?: WebhookLog[];
  stats?: WebhookStats;
}
```

#### POST `/api/webhook/admin`

**Purpose**: Update webhook configuration

**Request Body**:
```typescript
interface AdminUpdateRequest {
  action: 'update-config' | 'clear-logs' | 'test-webhook';
  data?: Partial<WebhookConfig>;
}
```

## GraphQL Queries

### Core Content Queries

#### Get Single Content Node

```graphql
query GetContentNode($id: ID!, $idType: ContentNodeIdTypeEnum) {
  contentNode(id: $id, idType: $idType) {
    id
    slug
    uri
    title
    content
    excerpt
    date
    modified
    status
    ... on Post {
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
      author {
        node {
          name
          avatar {
            url
          }
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
    ... on Page {
      parentId
      children {
        nodes {
          id
          slug
          title
        }
      }
    }
  }
}
```

#### Get Posts with Pagination

```graphql
query GetPosts(
  $first: Int
  $after: String
  $categoryName: String
  $search: String
) {
  posts(
    first: $first
    after: $after
    where: {
      categoryName: $categoryName
      search: $search
      status: PUBLISH
    }
  ) {
    nodes {
      id
      title
      excerpt
      slug
      date
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      author {
        node {
          name
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

#### Get Site Settings

```graphql
query GetSiteSettings {
  generalSettings {
    title
    description
    url
    language
    dateFormat
    timeFormat
  }
  
  # Custom site info (requires custom resolver)
  customSiteInfo {
    businessHours
    contactInfo {
      phone
      email
      address
    }
    socialMedia {
      facebook
      twitter
      instagram
    }
  }
}
```

### Menu Queries

#### Get Navigation Menu

```graphql
query GetMenu($location: MenuLocationEnum!) {
  menuItems(where: { location: $location }) {
    nodes {
      id
      label
      url
      target
      title
      parentId
      children {
        nodes {
          id
          label
          url
          target
        }
      }
    }
  }
}
```

## Custom Hooks

### useContentNode Hook

Fetch a single content node by ID or slug.

```typescript
function useContentNode(
  identifier: string | number,
  idType?: 'SLUG' | 'DATABASE_ID' | 'URI'
): {
  contentNode: ContentNode | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**Example**:
```tsx
const { contentNode, loading, error } = useContentNode('hello-world', 'SLUG');
```

### usePosts Hook

Fetch posts with pagination and filtering.

```typescript
function usePosts(options?: {
  first?: number;
  after?: string;
  categoryName?: string;
  search?: string;
}): {
  posts: Post[];
  pageInfo: PageInfo;
  loading: boolean;
  error: Error | null;
  fetchMore: (cursor: string) => void;
  refetch: () => void;
}
```

**Example**:
```tsx
const { posts, pageInfo, loading, fetchMore } = usePosts({
  first: 10,
  categoryName: 'technology'
});
```

### useSearch Hook

Search across WordPress content.

```typescript
function useSearch(query: string, options?: {
  contentTypes?: string[];
  first?: number;
}): {
  results: SearchResult[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
}
```

**Example**:
```tsx
const { results, loading } = useSearch('next.js', {
  contentTypes: ['POST', 'PAGE'],
  first: 20
});
```

### useMenu Hook

Fetch WordPress navigation menu.

```typescript
function useMenu(location: MenuLocation): {
  menuItems: MenuItem[];
  loading: boolean;
  error: Error | null;
}
```

**Example**:
```tsx
const { menuItems, loading } = useMenu('PRIMARY');
```

### useSiteSettings Hook

Fetch site configuration and settings.

```typescript
function useSiteSettings(): {
  settings: SiteSettings | null;
  loading: boolean;
  error: Error | null;
}
```

**Example**:
```tsx
const { settings } = useSiteSettings();
```

### usePreview Hook

Handle preview mode state and functionality.

```typescript
function usePreview(): {
  isPreview: boolean;
  previewData: any;
  exitPreview: () => void;
}
```

**Example**:
```tsx
const { isPreview, exitPreview } = usePreview();
```

## Utility Functions

### fetchGraphQL

Core GraphQL client for WordPress API communication.

```typescript
async function fetchGraphQL<T = any>(
  query: string,
  variables?: Record<string, any>,
  options?: {
    next?: NextFetchRequestConfig;
    cache?: RequestCache;
    tags?: string[];
  }
): Promise<T>
```

**Example**:
```typescript
const data = await fetchGraphQL(
  'query GetPost($slug: String!) { post(id: $slug, idType: SLUG) { title } }',
  { slug: 'hello-world' },
  { next: { revalidate: 3600 } }
);
```

### setSeoData

Generate SEO metadata for Next.js pages.

```typescript
function setSeoData(data: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata
```

**Example**:
```typescript
export function generateMetadata({ params }): Metadata {
  return setSeoData({
    title: 'Page Title',
    description: 'Page description',
    image: '/og-image.jpg',
    type: 'article'
  });
}
```

### parseBlocks

Parse WordPress Gutenberg blocks from content.

```typescript
function parseBlocks(
  content: string,
  options?: {
    validateAttributes?: boolean;
    stripInvalidBlocks?: boolean;
    allowedBlocks?: string[];
  }
): {
  blocks: Block[];
  errors: Error[];
  warnings: string[];
}
```

**Example**:
```typescript
const { blocks, errors } = parseBlocks(wordpressContent, {
  validateAttributes: true,
  allowedBlocks: ['core/paragraph', 'core/heading']
});
```

### slugToPath

Convert WordPress slug to Next.js path.

```typescript
function slugToPath(slug: string, type?: 'post' | 'page'): string
```

**Example**:
```typescript
const path = slugToPath('hello-world', 'post'); // '/blog/hello-world'
```

## Component APIs

### BlockRenderer Component

Render WordPress Gutenberg blocks in React.

```typescript
interface BlockRendererProps {
  content?: string;                    // WordPress HTML content
  blocks?: Block[];                    // Pre-parsed block array
  className?: string;                  // CSS class name
  options?: {
    allowedBlocks?: string[];          // Whitelist blocks
    disallowedBlocks?: string[];       // Blacklist blocks
    validateAttributes?: boolean;      // Validate block data
    stripInvalidBlocks?: boolean;      // Remove invalid blocks
  };
  fallbackComponent?: React.ComponentType<{
    error: Error;
    blockName?: string;
  }>;
  loadingComponent?: React.ComponentType;
  onBlockError?: (
    error: Error,
    errorInfo: React.ErrorInfo,
    block?: Block
  ) => void;
}
```

**Example**:
```tsx
<BlockRenderer
  content={post.content}
  options={{
    allowedBlocks: ['core/paragraph', 'core/heading'],
    validateAttributes: true
  }}
  onBlockError={(error, info, block) => {
    console.error('Block render error:', error);
  }}
/>
```

### PageTemplate Component

Template for WordPress pages.

```typescript
interface PageTemplateProps {
  page: {
    title: string;
    content: string;
    featuredImage?: {
      sourceUrl: string;
      altText: string;
    };
    seo?: SEOData;
  };
  className?: string;
  showFeaturedImage?: boolean;
}
```

### PostTemplate Component

Template for WordPress posts.

```typescript
interface PostTemplateProps {
  post: {
    title: string;
    content: string;
    excerpt: string;
    date: string;
    author: {
      name: string;
      avatar?: string;
    };
    categories: Array<{
      name: string;
      slug: string;
    }>;
    featuredImage?: {
      sourceUrl: string;
      altText: string;
    };
  };
  showAuthor?: boolean;
  showDate?: boolean;
  showCategories?: boolean;
  className?: string;
}
```

### Navigation Component

Site navigation with menu support.

```typescript
interface NavigationProps {
  menuItems: MenuItem[];
  logo?: {
    url: string;
    alt: string;
  };
  showThemeToggle?: boolean;
  className?: string;
}
```

## TypeScript Interfaces

### Core WordPress Types

```typescript
interface ContentNode {
  id: string;
  slug: string;
  uri: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  status: 'publish' | 'draft' | 'private';
}

interface Post extends ContentNode {
  categories: {
    nodes: Category[];
  };
  tags: {
    nodes: Tag[];
  };
  author: {
    node: Author;
  };
  featuredImage?: {
    node: MediaItem;
  };
}

interface Page extends ContentNode {
  parentId?: string;
  children?: {
    nodes: Page[];
  };
  template?: string;
}
```

### Block System Types

```typescript
interface Block {
  name: string;
  attributes: Record<string, any>;
  innerHTML: string;
  innerContent: string[];
  innerBlocks: Block[];
}

interface BlockComponentProps<T = any> {
  block: Block;
  attributes: T;
  innerHTML: string;
  className?: string;
}
```

### API Response Types

```typescript
interface GraphQLResponse<T = any> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
  extensions?: Record<string, any>;
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}
```

## Environment Variables

### Required Variables

```typescript
interface RequiredEnvVars {
  NEXT_PUBLIC_WORDPRESS_API_URL: string;     // WordPress GraphQL endpoint
  NEXT_PUBLIC_WORDPRESS_API_HOSTNAME: string; // WordPress domain
  NEXT_PUBLIC_BASE_URL: string;              // Next.js site URL
  HEADLESS_SECRET: string;                   // Webhook secret
}
```

### Optional Variables

```typescript
interface OptionalEnvVars {
  // Site Configuration
  NEXT_PUBLIC_SITE_NAME?: string;
  NEXT_PUBLIC_SITE_DESCRIPTION?: string;
  NEXT_PUBLIC_LOCALE?: string;
  
  // WordPress Authentication
  WP_USER?: string;
  WP_APP_PASS?: string;
  
  // Preview Mode
  WORDPRESS_PREVIEW_SECRET?: string;
  
  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
  NEXT_PUBLIC_GTM_ID?: string;
  
  // Webhook Security
  WEBHOOK_ALLOWED_IPS?: string;
  WEBHOOK_RATE_LIMIT_MAX?: string;
  WEBHOOK_RATE_LIMIT_WINDOW?: string;
  
  // External Services
  DATABASE_URL?: string;
  REDIS_URL?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
}
```

## Webhook System

### WordPress Plugin API

The included WordPress plugin provides these endpoints:

#### Trigger Webhook

```php
// PHP function to trigger webhook
function trigger_nextjs_revalidation($post_id, $action = 'save_post') {
    $webhook_url = get_option('nextjs_webhook_url');
    $secret = get_option('nextjs_webhook_secret');
    
    $data = array(
        'post_id' => $post_id,
        'action' => $action,
        'timestamp' => time(),
    );
    
    wp_remote_post($webhook_url, array(
        'headers' => array(
            'X-Headless-Secret-Key' => $secret,
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode($data),
        'timeout' => 30,
    ));
}
```

#### WP-CLI Commands

```bash
# Test webhook connection
wp nextjs-webhook test

# Trigger manual revalidation
wp nextjs-webhook trigger --post_id=123

# View webhook logs
wp nextjs-webhook logs --limit=20

# Clear webhook logs
wp nextjs-webhook clear-logs

# Show webhook statistics
wp nextjs-webhook stats
```

### Webhook Configuration

```typescript
interface WebhookConfig {
  enabled: boolean;
  url: string;
  secret: string;
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  triggers: {
    posts: boolean;
    pages: boolean;
    comments: boolean;
    menus: boolean;
    customizer: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  logging: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug';
    includePayload: boolean;
    maxEntries: number;
  };
}
```

## Error Handling

### Error Types

```typescript
interface APIError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

interface GraphQLError extends Error {
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
  extensions?: Record<string, any>;
}

interface ValidationError extends Error {
  field?: string;
  value?: any;
  constraint?: string;
}
```

### Error Responses

All API endpoints return consistent error responses:

```typescript
interface ErrorResponse {
  error: string;                    // Error message
  code?: string;                   // Error code
  status: number;                  // HTTP status code
  details?: any;                   // Additional error details
  timestamp: string;               // ISO timestamp
  path: string;                    // Request path
}
```

## Rate Limiting

### Rate Limit Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
X-RateLimit-Window: 3600
```

### Rate Limit Configuration

```typescript
interface RateLimitConfig {
  windowMs: number;               // Time window in milliseconds
  max: number;                    // Maximum requests per window
  message: string;               // Error message when limit exceeded
  standardHeaders: boolean;       // Include standard headers
  legacyHeaders: boolean;        // Include legacy headers
  skipSuccessfulRequests: boolean; // Skip successful requests
  skipFailedRequests: boolean;    // Skip failed requests
}
```

This API documentation provides comprehensive coverage of all available endpoints, hooks, utilities, and interfaces in the WordPress Next.js starter template. Use it as a reference when building custom functionality or integrating with external services.