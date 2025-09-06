# Next.js WordPress Revalidation Webhook System

A comprehensive, production-ready webhook system for instant content updates between WordPress and Next.js with ISR (Incremental Static Regeneration).

## 🚀 Features

### Core Functionality
- **Instant Content Updates**: Automatic revalidation when WordPress content changes
- **Secure Token Validation**: Multi-header authentication with configurable tokens
- **Intelligent Path Mapping**: Smart revalidation based on content relationships
- **Rate Limiting**: Advanced rate limiting with IP blocking and configurable windows
- **Comprehensive Logging**: Detailed request/response logging with statistics
- **Error Handling & Retry Logic**: Robust error handling with exponential backoff
- **WordPress Plugin**: Full-featured plugin with admin interface

### Advanced Features
- **Multiple Trigger Types**: Posts, pages, comments, menus, customizer, plugins
- **Content Relationship Mapping**: Cascade revalidation for related content
- **Admin Dashboard**: Statistics, logs, and configuration management
- **CLI Integration**: WP-CLI commands for manual triggers and management
- **REST API**: RESTful endpoints for programmatic control
- **Health Monitoring**: Built-in health checks and performance metrics

## 📋 Architecture

### Next.js Components

#### 1. API Routes
```
/api/revalidate
├── PUT    - Manual revalidation with paths/tags
├── POST   - WordPress webhook integration
└── GET    - Health check and statistics

/api/webhook/admin
├── GET    - Admin dashboard data
└── POST   - Configuration management
```

#### 2. Core Libraries
```
src/lib/webhook/
├── security.ts      - Authentication and rate limiting
├── logger.ts        - Comprehensive logging system
├── revalidation.ts  - Intelligent revalidation logic
└── config.ts        - Configuration management
```

#### 3. Type Definitions
```typescript
// Enhanced webhook interfaces
export interface RevalidationRequest {
  paths?: string[];
  tags?: string[];
  contentType?: 'post' | 'page' | 'custom' | 'all';
  contentId?: string | number;
  action?: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  priority?: 'high' | 'normal' | 'low';
  metadata?: Record<string, any>;
}
```

### WordPress Plugin

#### 1. Main Plugin File
- **Hook Integration**: 15+ WordPress hooks for comprehensive coverage
- **Admin Interface**: Full-featured settings page with tabs
- **Database Logging**: Custom table for webhook request logs
- **Rate Limiting**: Built-in rate limiting with WordPress transients
- **Retry Logic**: Configurable retry attempts with exponential backoff

#### 2. Supported Triggers
- Post/page creation, updates, deletion
- Status changes (publish, draft, private)
- Comment updates and status changes
- Term (category/tag) modifications
- Menu updates
- Customizer saves
- Plugin/theme activation changes

## 🛠️ Installation & Setup

### 1. Next.js Configuration

#### Environment Variables
```bash
# Required
HEADLESS_SECRET=your-super-secure-secret-token

# Optional Security
WEBHOOK_ALLOWED_IPS=192.168.1.100,10.0.0.0/24
WEBHOOK_RATE_LIMIT_MAX=30
WEBHOOK_RATE_LIMIT_WINDOW=60000

# Optional Logging
WEBHOOK_LOG_ENABLED=true
WEBHOOK_LOG_LEVEL=info
WEBHOOK_LOG_INCLUDE_PAYLOAD=true
WEBHOOK_LOG_MAX_ENTRIES=2000
```

#### Install Dependencies
The system is built with existing Next.js dependencies. No additional packages required.

### 2. WordPress Plugin Installation

#### Option A: Manual Installation
1. Copy the `wordpress-plugin/` directory to your WordPress plugins folder
2. Rename to `nextjs-revalidation-webhook/`
3. Activate the plugin in WordPress admin
4. Configure settings under Settings → Next.js Webhook

#### Option B: Upload Plugin
1. Zip the `wordpress-plugin/` directory
2. Upload via WordPress admin → Plugins → Add New → Upload Plugin
3. Activate and configure

### 3. Plugin Configuration

Navigate to **Settings → Next.js Webhook** and configure:

#### General Settings
- **Webhook URL**: `https://your-nextjs-site.com/api/revalidate`
- **Secret Token**: Must match `HEADLESS_SECRET` environment variable
- **Enable Plugin**: Toggle automatic revalidation

#### Triggers Configuration
- **Content Types**: Choose which content types trigger revalidation
- **Actions**: Configure which actions trigger revalidation
- **Excluded Types**: Comma-separated list of post types to exclude

#### Advanced Settings
- **Rate Limiting**: Prevent webhook spam
- **Retry Logic**: Configure retry attempts and delays
- **Logging**: Enable detailed request logging
- **Timeout Settings**: Adjust request timeout values

## 📡 API Reference

### 1. Revalidation Endpoint

#### Manual Revalidation (PUT)
```bash
curl -X PUT https://your-site.com/api/revalidate \
  -H "X-Headless-Secret-Key: your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "paths": ["/", "/blog", "/about"],
    "tags": ["posts", "navigation"],
    "contentType": "post",
    "contentId": 123,
    "action": "update",
    "priority": "high"
  }'
```

#### WordPress Integration (POST)
```bash
curl -X POST https://your-site.com/api/revalidate \
  -H "X-Headless-Secret-Key: your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 123,
    "post_type": "post",
    "post_status": "publish",
    "action": "save_post",
    "timestamp": 1635789012
  }'
```

#### Health Check (GET)
```bash
curl https://your-site.com/api/revalidate
# Add ?stats=1 with secret header for statistics
```

### 2. Admin Endpoint

#### Get Configuration
```bash
curl https://your-site.com/api/webhook/admin?action=config \
  -H "X-Headless-Secret-Key: your-secret-token"
```

#### Update Configuration
```bash
curl -X POST https://your-site.com/api/webhook/admin \
  -H "X-Headless-Secret-Key: your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update-config",
    "data": {
      "logging": {
        "enabled": true,
        "level": "debug"
      }
    }
  }'
```

## 🔧 Configuration Management

### 1. Environment-Based Configuration

The system automatically loads configuration from environment variables:

```typescript
const configManager = WebhookConfigManager.getInstance();
const config = configManager.getConfig();

// Validate configuration
const validation = configManager.validateConfig();
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

### 2. Dynamic Configuration Updates

```typescript
// Update security settings
configManager.updateConfig({
  security: {
    rateLimitMaxRequests: 50,
    rateLimitWindowMs: 120000,
  }
});

// Update revalidation strategy
configManager.updateRevalidationStrategy({
  immediate: [
    {
      contentType: 'post',
      pattern: '/blog/:slug',
      pathGenerator: (content) => [`/blog/${content.slug}`],
      tags: ['blog', 'posts'],
    }
  ]
});
```

### 3. Custom Path Generators

Create custom revalidation logic:

```typescript
const customGenerator = WebhookConfigManager.createCustomPathGenerator(
  '/products/:category/:slug',
  (content) => {
    const paths = [];
    
    if (content.slug) {
      paths.push(`/products/${content.category}/${content.slug}`);
    }
    
    // Revalidate category page
    if (content.category) {
      paths.push(`/products/${content.category}`);
    }
    
    // Revalidate products index
    paths.push('/products');
    
    return paths;
  }
);
```

## 📊 Monitoring & Debugging

### 1. Built-in Statistics

Access comprehensive webhook statistics:

```bash
# Via API
curl https://your-site.com/api/revalidate?stats=1 \
  -H "X-Headless-Secret-Key: your-secret-token"

# Response includes:
{
  "totalRequests": 1250,
  "successfulRequests": 1200,
  "errorRequests": 50,
  "averageProcessingTime": 145.5,
  "topIPs": [...],
  "revalidationStats": {...}
}
```

### 2. Detailed Logging

The logging system captures:
- Request/response details
- Processing times
- Error messages and stack traces
- IP addresses and user agents
- Payload data (configurable)
- Retry attempts

### 3. WordPress Admin Logs

View logs in the WordPress admin:
- Real-time log display
- Filterable by status, content type, date
- Export functionality
- Manual log clearing
- Test webhook functionality

## 🔒 Security Features

### 1. Authentication
- **Multiple Header Support**: `X-Headless-Secret-Key`, `X-Webhook-Secret`, `Authorization`
- **Token Validation**: Secure token comparison
- **Secret Rotation**: Environment-based token management

### 2. Rate Limiting
- **IP-based Limiting**: Configurable requests per time window
- **Automatic IP Blocking**: Temporary blocks for exceeding limits
- **Success-based Skip**: Optional successful request exclusion
- **Custom Key Generation**: Flexible rate limit key strategies

### 3. IP Whitelisting
- **CIDR Support**: Network range whitelisting
- **Dynamic IP Detection**: Multiple IP header support
- **Flexible Configuration**: Environment variable configuration

### 4. Input Validation
- **Comprehensive Validation**: All input parameters validated
- **Size Limits**: Maximum paths/tags per request
- **Type Checking**: Strict type validation
- **XSS Prevention**: Input sanitization

## 🚀 Performance Optimization

### 1. Efficient Revalidation
- **Batch Processing**: Multiple paths/tags in single request
- **Intelligent Mapping**: Content relationship-based revalidation
- **Priority Queuing**: High/normal/low priority processing
- **Cascade Prevention**: Avoid recursive revalidation

### 2. Caching & Storage
- **Memory-based Rate Limiting**: Fast in-memory storage
- **Transient-based Caching**: WordPress transient API usage
- **Log Rotation**: Automatic old log cleanup
- **Efficient Database Queries**: Optimized WordPress queries

## 🛡️ Production Considerations

### 1. Scaling
- For high-traffic sites, consider:
  - Redis for rate limiting and caching
  - Database-backed logging
  - Load balancer configuration
  - CDN integration

### 2. Monitoring
- Set up alerts for:
  - High error rates
  - Rate limit breaches
  - Webhook timeouts
  - Configuration changes

### 3. Backup & Recovery
- Export configuration regularly
- Monitor webhook logs for patterns
- Test disaster recovery procedures
- Document custom configurations

## 📚 Troubleshooting

### Common Issues

#### 1. Authentication Failures
- Verify `HEADLESS_SECRET` matches WordPress plugin settings
- Check header case sensitivity
- Validate environment variable loading

#### 2. Rate Limiting
- Increase rate limit values if needed
- Check for automated tools causing high request volume
- Verify IP whitelisting configuration

#### 3. Revalidation Not Working
- Test with manual webhook trigger
- Check Next.js revalidation functions
- Verify path/tag configurations
- Review error logs for specific failures

#### 4. Performance Issues
- Monitor processing times in logs
- Check network connectivity between WordPress and Next.js
- Optimize path generation functions
- Consider rate limiting adjustments

### Debug Commands

#### WordPress WP-CLI
```bash
# Test webhook
wp nextjs-revalidate test

# Show recent logs
wp nextjs-revalidate logs --limit=20

# Manual trigger
wp nextjs-revalidate trigger --post_id=123

# Clear old logs
wp nextjs-revalidate clear-logs
```

#### Next.js Verification
```bash
# Health check
curl https://your-site.com/api/revalidate

# Test with invalid token
curl -H "X-Headless-Secret-Key: wrong-token" \
  https://your-site.com/api/revalidate

# Check statistics
curl https://your-site.com/api/revalidate?stats=1 \
  -H "X-Headless-Secret-Key: correct-token"
```

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Install WordPress plugin in test environment

### Testing
- Unit tests for webhook components
- Integration tests for WordPress plugin
- End-to-end tests for full workflow
- Security testing for authentication flows

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive error handling

---

## 📄 License

MIT License - see LICENSE file for details.

## 📞 Support

For issues and questions:
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Documentation: [Full Documentation](https://your-docs-site.com)
- Community: [Discord/Slack Channel](https://your-community-link.com)