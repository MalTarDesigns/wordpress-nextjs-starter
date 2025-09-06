# WordPress Next.js Starter by MalTar Designs

<div align="center">

![MalTar Designs](https://img.shields.io/badge/Made%20by-MalTar%20Designs-blue.svg?style=for-the-badge)
![Version](https://img.shields.io/github/v/release/MalTarDesigns/wordpress-nextjs-starter?style=for-the-badge)
![License](https://img.shields.io/github/license/MalTarDesigns/wordpress-nextjs-starter?style=for-the-badge)

**Production-ready WordPress headless CMS starter built with Next.js 15, TypeScript, and comprehensive client-focused features.**

*Enhanced with advanced BlockRenderer, testing suite, security features, and deployment automation for agencies and developers.*

[🚀 Get Started](#-quick-start-guide) • [📖 Documentation](./docs/) • [🎯 Live Demo](#) • [💼 Hire MalTar Designs](mailto:contact@maltardesigns.com)

</div>

---

## 🏆 Enhanced by MalTar Designs

This template is built upon Vercel's Next.js WordPress CMS example and significantly enhanced with enterprise-grade features, comprehensive testing, and client-focused development workflows.

## 🚀 Features

### Core Technologies
- **Next.js 15** with App Router and React Server Components
- **TypeScript** with strict type safety and comprehensive WordPress types
- **GraphQL** with automated code generation and type-safe queries
- **Tailwind CSS 4** with shadcn/ui components and dark mode support
- **ISR (Incremental Static Regeneration)** for optimal performance
- **Jest & Playwright** for comprehensive testing (unit, integration, E2E)

### WordPress Integration
- **Advanced Block Renderer** with support for Gutenberg blocks and ACF flexible content
- **Type-safe GraphQL queries** with comprehensive WordPress type definitions
- **Preview mode** support for draft content with security tokens
- **WordPress redirects** handling via Redirection plugin
- **SEO optimization** with Yoast/RankMath compatibility and structured data
- **Real-time webhook system** for instant content updates
- **WordPress plugin** for seamless integration and admin management

### Performance & SEO
- **Enhanced metadata API** with WordPress SEO data integration
- **Automatic sitemap** generation with dynamic content
- **Cache-first strategy** with intelligent revalidation
- **Bundle analysis** and optimization tools
- **Security headers** and comprehensive rate limiting
- **Image optimization** with Next.js Image component and WordPress media
- **Core Web Vitals** optimization

### Developer Experience
- **Environment validation** with comprehensive type checking
- **Custom hooks** for WordPress data fetching and state management
- **Error boundaries** with graceful fallbacks and debugging
- **Development tools** with hot reloading and comprehensive debugging
- **Comprehensive testing** with 80% coverage requirement
- **CLI deployment** scripts and production optimization

## 📦 Quick Start Guide

### Prerequisites

- **Node.js** 18+ with npm/pnpm
- **WordPress site** with GraphQL enabled (WPGraphQL plugin)
- **Domain** for deployment (optional for testing)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd wordpress-next-starter

# Install dependencies (pnpm recommended)
pnpm install

# Or with npm
npm install
```

### 2. Environment Configuration

Copy the appropriate environment template:

```bash
# For local development
cp .env.example .env.local

# For Vercel deployment
cp .env.vercel.example .env.local
```

Configure your WordPress connection:

```env
# WordPress API Configuration (Required)
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com
NEXT_PUBLIC_WORDPRESS_API_HOSTNAME=your-wordpress-site.com
NEXT_PUBLIC_BASE_URL=https://your-nextjs-site.com
HEADLESS_SECRET=your-super-secret-key-min-32-characters

# WordPress Authentication (Optional - for enhanced features)
WP_USER=your-wp-username
WP_APP_PASS=your-app-password

# Site Metadata (Optional)
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description"
```

### 3. WordPress Setup

Install required WordPress plugins:

```bash
# Required plugins
- WPGraphQL (enables GraphQL API)
- WPGraphQL for Advanced Custom Fields (if using ACF)
- Yoast SEO or RankMath (for SEO data)

# Optional plugins
- Redirection (for URL redirects)
- WP Headless (for enhanced headless features)
```

### 4. Generate Types and Start Development

```bash
# Generate TypeScript types from WordPress GraphQL schema
pnpm codegen

# Validate environment configuration
pnpm validate-env

# Start development server with Turbo
pnpm dev
```

## 🏗️ Project Structure

```
wordpress-next-starter/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── layout.tsx               # Root layout with metadata
│   │   ├── [[...slug]]/            # Dynamic WordPress routing
│   │   │   └── page.tsx            # Main page template
│   │   ├── api/                    # API routes
│   │   │   ├── revalidate/         # Webhook revalidation
│   │   │   ├── preview/            # Preview mode
│   │   │   └── webhook/            # Webhook management
│   │   ├── demo/                   # Component showcase
│   │   ├── sitemap.ts              # Dynamic sitemap
│   │   └── robots.ts               # Robots.txt
│   ├── components/
│   │   ├── Templates/              # Content templates
│   │   │   ├── Page/              # Page template
│   │   │   └── Post/              # Post template
│   │   ├── Globals/               # Global components
│   │   │   ├── Navigation/        # Site navigation
│   │   │   └── PreviewNotice/     # Preview mode notice
│   │   ├── BlockRenderer/         # WordPress block system
│   │   │   ├── blocks/            # Block components
│   │   │   └── README.md          # Block system docs
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utility libraries
│   │   └── env.ts                 # Environment validation
│   ├── types/                     # TypeScript definitions
│   │   ├── wordpress.ts           # WordPress types
│   │   ├── blocks.ts              # Block types
│   │   └── env.d.ts               # Environment types
│   └── utils/                     # Utility functions
│       ├── fetchGraphQL.ts        # GraphQL client
│       ├── seoData.ts             # SEO utilities
│       └── blockParser.ts         # Block parsing
├── __tests__/                     # Test files
│   ├── unit/                      # Unit tests
│   ├── components/                # Component tests
│   ├── api/                       # API tests
│   └── integration/               # Integration tests
├── e2e/                          # End-to-end tests
├── docs/                         # Documentation
├── scripts/                      # Utility scripts
├── wordpress-plugin/             # WordPress integration plugin
└── vercel.json                   # Vercel configuration
```

## 🔧 Available Scripts

### Development
```bash
pnpm dev                    # Start development server with Turbo
pnpm dev:codegen           # Generate types and start dev server
pnpm validate-env          # Validate environment variables
```

### Building
```bash
pnpm build                 # Build for production
pnpm build:analyze         # Build with bundle analysis
pnpm build:full           # Generate types and build
pnpm build:static         # Build as static site
pnpm build:production     # Production build with optimizations
```

### Code Quality
```bash
pnpm lint                  # ESLint with auto-fix
pnpm lint:strict          # ESLint with zero warnings
pnpm type-check           # TypeScript compiler check
```

### Testing
```bash
pnpm test                  # Run all Jest tests
pnpm test:watch           # Watch mode testing
pnpm test:coverage        # Generate coverage report
pnpm test:e2e             # End-to-end tests with Playwright
pnpm test:all             # All tests (Jest + Playwright)
```

### GraphQL & Types
```bash
pnpm codegen              # Generate types from GraphQL schema
pnpm codegen:watch        # Watch for schema changes
```

### Deployment
```bash
pnpm deploy               # Deploy to Vercel production
pnpm deploy:preview       # Deploy to Vercel preview
```

## 🎯 Client Setup Checklist (For Agencies)

### WordPress Configuration
- [ ] Install WPGraphQL plugin and verify GraphQL endpoint
- [ ] Configure ACF fields and register with GraphQL (if applicable)  
- [ ] Install and configure SEO plugin (Yoast/RankMath)
- [ ] Set up WordPress Application Passwords for API access
- [ ] Configure CORS headers for headless access
- [ ] Install optional plugins (Redirection, Custom Post Types)

### Next.js Configuration
- [ ] Clone repository and install dependencies
- [ ] Copy and configure environment variables
- [ ] Generate GraphQL types from WordPress schema
- [ ] Test local development server
- [ ] Validate environment configuration

### Content Migration
- [ ] Import existing WordPress content
- [ ] Configure custom post types and fields
- [ ] Set up navigation menus
- [ ] Configure media library and optimize images
- [ ] Test content rendering in Next.js

### SEO Setup
- [ ] Configure site metadata and branding
- [ ] Set up Google Analytics and Search Console
- [ ] Verify structured data markup
- [ ] Test social media sharing (Open Graph, Twitter Cards)
- [ ] Configure XML sitemap generation

### Performance Optimization
- [ ] Configure image optimization settings
- [ ] Set up CDN for WordPress media (optional)
- [ ] Configure caching strategy
- [ ] Test Core Web Vitals scores
- [ ] Optimize bundle size and loading performance

### Deployment Preparation
- [ ] Choose hosting platform (Vercel recommended)
- [ ] Configure custom domain and SSL
- [ ] Set up environment variables in hosting platform
- [ ] Configure deployment scripts
- [ ] Set up monitoring and error tracking

### Post-Launch
- [ ] Test all functionality in production
- [ ] Set up WordPress webhook for content updates
- [ ] Configure backup and maintenance procedures
- [ ] Train client on content management
- [ ] Document custom features and configurations

## 🔐 Environment Variables Documentation

### Required Variables

```bash
# WordPress Connection
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wp-site.com
NEXT_PUBLIC_WORDPRESS_API_HOSTNAME=your-wp-site.com
NEXT_PUBLIC_BASE_URL=https://your-nextjs-site.com
HEADLESS_SECRET=your-64-character-secret-token

# Generate secure tokens
openssl rand -hex 32  # For HEADLESS_SECRET
```

### Optional Variables

```bash
# Site Branding
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description"
NEXT_PUBLIC_LOCALE=en_US

# WordPress Authentication (enables advanced features)
WP_USER=your_wp_username
WP_APP_PASS=your_wp_application_password

# Preview Mode
WORDPRESS_PREVIEW_SECRET=your-preview-secret

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Security & Performance
WEBHOOK_ALLOWED_IPS=comma,separated,ips
WEBHOOK_RATE_LIMIT_MAX=30
WEBHOOK_RATE_LIMIT_WINDOW=60000
WEBHOOK_LOG_ENABLED=true

# External Services
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://user:pass@host:6379
SMTP_HOST=smtp.provider.com
```

## ⚙️ WordPress Configuration Guide

### 1. Required Plugin Installation

```bash
# Install via WP-CLI
wp plugin install wp-graphql --activate
wp plugin install wp-graphql-acf --activate  # If using ACF
wp plugin install wordpress-seo --activate   # Or rankmath

# Or install via WordPress admin
# Plugins → Add New → Search for each plugin
```

### 2. GraphQL Configuration

Add to WordPress `wp-config.php`:
```php
// Enable GraphQL debugging (development only)
define('GRAPHQL_DEBUG', true);

// Configure CORS for headless access
add_action('init', function() {
    remove_action('rest_api_init', 'rest_cookie_collect_status');
});

add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://your-nextjs-site.com');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
}, 15);
```

### 3. Create Application Password

1. Go to WordPress Admin → Users → Your Profile
2. Scroll to "Application Passwords" section
3. Enter "Next.js Headless Site" as application name
4. Click "Add New Application Password"
5. Copy the generated password for `WP_APP_PASS`

### 4. WordPress Plugin Integration

Install the included WordPress plugin:
1. Copy `wordpress-plugin/` to `/wp-content/plugins/nextjs-revalidation-webhook/`
2. Activate in WordPress admin
3. Configure under Settings → Next.js Webhook
4. Set webhook URL: `https://your-nextjs-site.com/api/revalidate`
5. Enter secret token matching `HEADLESS_SECRET`

## 🚀 Vercel Deployment Instructions

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Configure build settings:
   - **Framework**: Next.js
   - **Build Command**: `pnpm build:full`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install --frozen-lockfile`

### Environment Variables Setup

Configure these in Vercel dashboard:

**Production Environment:**
- NEXT_PUBLIC_WORDPRESS_API_URL
- NEXT_PUBLIC_BASE_URL (your custom domain)
- HEADLESS_SECRET
- All optional variables as needed

**Build Optimization:**
```json
{
  "buildCommand": "pnpm build:full",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Custom Domain Configuration

```bash
# Add domain via CLI
vercel domains add your-domain.com

# Configure DNS (A record)
Type: A
Name: @
Value: 76.76.19.61

# Update environment variables with new domain
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 📚 Component API Documentation

### BlockRenderer Component

The core component for rendering WordPress blocks:

```tsx
import BlockRenderer from '@/components/BlockRenderer';

<BlockRenderer 
  content={wordpressContent}           // WordPress HTML content
  blocks={parsedBlocks}               // Pre-parsed block array
  className="my-blocks"               // CSS class
  options={{
    allowedBlocks: ['core/paragraph'], // Whitelist blocks
    validateAttributes: true,          // Validate block data
    stripInvalidBlocks: true          // Remove invalid blocks
  }}
  fallbackComponent={CustomError}     // Custom error component
  onBlockError={(error, block) => {}} // Error handler
/>
```

### WordPress Data Hooks

Custom hooks for fetching WordPress data:

```tsx
import { 
  useContentNode, 
  usePosts, 
  useSearch, 
  useMenu,
  useSiteSettings 
} from '@/hooks/useWordPress';

// Get single content node
const { contentNode, loading, error } = useContentNode(slug);

// Get posts with pagination
const { posts, pageInfo, loading } = usePosts({ first: 10 });

// Search content
const { results, loading } = useSearch(query);

// Get navigation menu
const { menuItems, loading } = useMenu('PRIMARY');

// Get site settings
const { settings, loading } = useSiteSettings();
```

### Template Components

Pre-built templates for WordPress content:

```tsx
import { PageTemplate } from '@/components/Templates/Page';
import { PostTemplate } from '@/components/Templates/Post';

<PageTemplate 
  page={pageData}
  className="custom-page"
/>

<PostTemplate 
  post={postData}
  showAuthor={true}
  showDate={true}
/>
```

## 🎨 Customization and Theming Guide

### Tailwind CSS Configuration

The project uses Tailwind CSS 4 with CSS variables for theming:

```css
/* src/app/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --secondary: 0 0% 96.1%;
  /* ... more variables */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark theme variables */
}
```

### Adding Custom Blocks

1. Create block component:
```tsx
// src/components/BlockRenderer/blocks/custom/MyBlock.tsx
import { BlockComponentProps } from '@/types/blocks';

export function MyCustomBlock({ attributes }: BlockComponentProps) {
  return (
    <div className="my-custom-block">
      <h3>{attributes.title}</h3>
      <p>{attributes.content}</p>
    </div>
  );
}
```

2. Register the block:
```tsx
// src/components/BlockRenderer/registerBlocks.ts
import { BlockRegistry } from '@/components/BlockRegistry';

BlockRegistry.registerBlock({
  name: 'custom/my-block',
  component: MyCustomBlock,
  category: 'custom'
});
```

### Custom Styling

Add custom styles using Tailwind utilities or custom CSS:

```tsx
// Component with Tailwind
<div className="bg-primary text-primary-foreground rounded-lg p-6">
  Custom styled content
</div>

// Custom CSS classes
<div className="hero-section">
  <style jsx>{`
    .hero-section {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
    }
  `}</style>
</div>
```

### Theme Customization

Extend the default theme in `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

## 🤝 Contributing Guidelines

### Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Run tests: `pnpm test`
5. Start development server: `pnpm dev`

### Code Standards

- **TypeScript**: Strict mode enabled, comprehensive typing required
- **Testing**: 80% coverage minimum, all new features must include tests
- **Linting**: ESLint configuration must pass with zero warnings
- **Commits**: Use conventional commit format

### Pull Request Process

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and add tests
3. Ensure all tests pass: `pnpm test:all`
4. Update documentation if needed
5. Submit pull request with detailed description

### Testing Requirements

- Unit tests for utilities and hooks
- Component tests for React components
- Integration tests for API endpoints
- E2E tests for user workflows

## 🔍 Troubleshooting Section

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
pnpm clean
pnpm install --frozen-lockfile
pnpm build:full
```

#### WordPress Connection Issues
- Verify GraphQL endpoint: `https://your-wp-site.com/graphql`
- Check WPGraphQL plugin is active and updated
- Verify CORS settings in WordPress
- Test with GraphiQL interface

#### Environment Variable Problems
```bash
# Validate environment
pnpm validate-env

# Check specific variables
echo $NEXT_PUBLIC_WORDPRESS_API_URL
```

#### TypeScript Errors
```bash
# Regenerate types from WordPress
pnpm codegen

# Check TypeScript compilation
pnpm type-check
```

#### Performance Issues
```bash
# Analyze bundle size
pnpm build:analyze

# Test production build locally
pnpm build:production && pnpm start
```

### Debug Commands

```bash
# View detailed error logs
pnpm dev --debug

# Test specific components
pnpm test ComponentName

# Validate configuration
pnpm validate-env:production

# Check webhook functionality
curl -X POST https://your-site.com/api/revalidate \
  -H "X-Headless-Secret-Key: your-secret" \
  -d '{"test": true}'
```

### Getting Help

1. **Check logs first**: Review build/deployment logs for specific errors
2. **Verify environment**: Ensure all required environment variables are set
3. **Test locally**: Reproduce issues in local development environment
4. **Review documentation**: Check specific feature documentation
5. **Community support**: GitHub issues and discussions

---

## 🏢 About MalTar Designs

**Professional WordPress & Next.js Development Services**

MalTar Designs specializes in modern web development with WordPress headless CMS solutions. We help agencies and businesses build high-performance, scalable websites with cutting-edge technologies.

### Our Services
- ✅ **Headless WordPress Development** - Custom Next.js + WordPress solutions
- ✅ **Agency Partnerships** - White-label development services
- ✅ **Template Customization** - Tailored implementations for your clients
- ✅ **Performance Optimization** - Speed and SEO improvements
- ✅ **Ongoing Maintenance** - Technical support and updates

### Why This Template?

We built this enhanced template to solve real-world challenges we encounter in client projects:
- **Enterprise-grade security** with comprehensive rate limiting and validation
- **Advanced content management** with flexible block rendering system
- **Production-ready testing** with automated quality assurance
- **Client-focused workflows** with streamlined setup and deployment
- **Performance optimizations** that deliver measurable results

### Get Professional Help

Need help implementing this template or building a custom solution?

📧 **Email**: [contact@maltardesigns.com](mailto:contact@maltardesigns.com)  
🌐 **Website**: [maltardesigns.com](https://maltardesigns.com)  
💼 **LinkedIn**: [MalTar Designs](https://linkedin.com/company/maltar-designs)  

*We offer free consultations for agencies and businesses looking to modernize their WordPress workflows.*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js team** for the exceptional framework and App Router
- **WordPress and WPGraphQL** communities for headless CMS capabilities
- **Vercel** for deployment platform and optimization tools
- **Tailwind CSS** and **Radix UI** for design system components
- **TypeScript** team for type safety and developer experience

---

**Ready to build something amazing? Get started with the Quick Start guide above!**

For detailed implementation guides, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [TAILWIND_SETUP.md](./TAILWIND_SETUP.md) - Styling and theming
- [docs/WEBHOOK_SYSTEM.md](./docs/WEBHOOK_SYSTEM.md) - Webhook integration
- [TESTING.md](./TESTING.md) - Testing strategies

**Built with ❤️ for the WordPress and Next.js communities**