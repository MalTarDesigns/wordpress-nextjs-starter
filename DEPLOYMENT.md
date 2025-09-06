# WordPress Next.js Starter - Vercel Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Custom Domain Setup](#custom-domain-setup)
5. [Performance Optimization](#performance-optimization)
6. [Security Configuration](#security-configuration)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

## Prerequisites

Before deploying your WordPress Next.js starter to Vercel, ensure you have:

- A WordPress site with GraphQL enabled (WPGraphQL plugin installed)
- A Vercel account ([sign up here](https://vercel.com))
- Git repository with your code
- Node.js 18+ and pnpm installed locally
- Access to your WordPress admin panel

## Environment Setup

### 1. WordPress Configuration

First, ensure your WordPress site is properly configured:

#### Install Required Plugins
```bash
# Required plugins for your WordPress site:
- WPGraphQL (free)
- WPGraphQL for Advanced Custom Fields (if using ACF)
- Custom Post Type UI (if using custom post types)
```

#### Create Application Password (Recommended)
1. Go to WordPress Admin → Users → Your Profile
2. Scroll to "Application Passwords" section
3. Enter "Next.js Headless Site" as the name
4. Click "Add New Application Password"
5. Copy the generated password (you'll need this for `WP_APP_PASS`)

### 2. Environment Variables Setup

#### Required Environment Variables

Copy `.env.vercel.example` and configure these required variables:

```env
# WordPress Connection (REQUIRED)
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com
NEXT_PUBLIC_WORDPRESS_API_HOSTNAME=your-wordpress-site.com
NEXT_PUBLIC_BASE_URL=https://your-site.vercel.app
HEADLESS_SECRET=your-64-character-secret-here
```

#### Generate Secure Secrets

```bash
# Generate HEADLESS_SECRET (64 characters)
openssl rand -hex 32

# Generate WORDPRESS_PREVIEW_SECRET (32 characters)  
openssl rand -hex 16
```

#### Optional but Recommended Variables

```env
# Site Branding
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description"
NEXT_PUBLIC_LOCALE=en_US

# WordPress Authentication (enables advanced features)
WP_USER=your_wordpress_username
WP_APP_PASS=your_wordpress_application_password

# Preview Mode Security
WORDPRESS_PREVIEW_SECRET=your-preview-secret

# Analytics (if using)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

## Vercel Deployment

### Option 1: Deploy with Vercel CLI (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy (first time - will create project)
vercel

# 4. Follow prompts:
# - Link to existing project? No
# - Project name: your-project-name
# - Directory: ./ (current directory)
# - Want to override settings? No

# 5. Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project" → "Import Git Repository"
4. Select your repository
5. Configure project settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build:full`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install --frozen-lockfile`

### 3. Configure Environment Variables in Vercel

#### Via Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from your `.env` file
3. Set appropriate environments (Production, Preview, Development)

#### Via CLI:
```bash
# Add environment variables
vercel env add NEXT_PUBLIC_WORDPRESS_API_URL
vercel env add HEADLESS_SECRET
vercel env add WORDPRESS_PREVIEW_SECRET
# ... add all required variables
```

### 4. Verify Deployment

After deployment:
1. Check build logs for any errors
2. Test your site functionality
3. Verify WordPress content loads correctly
4. Test responsive design on different devices

## Custom Domain Setup

### 1. Add Custom Domain

```bash
# Via CLI
vercel domains add your-domain.com

# Or via Dashboard:
# Project Settings → Domains → Add Domain
```

### 2. Configure DNS Records

Add these DNS records at your domain registrar:

```dns
# For root domain (example.com)
Type: A
Name: @
Value: 76.76.19.61

# For www subdomain
Type: CNAME  
Name: www
Value: cname.vercel-dns.com

# For subdomain (app.example.com)
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

### 3. SSL Certificate

Vercel automatically provides SSL certificates. After DNS propagation (can take up to 24 hours):
- Certificate will be issued automatically
- HTTPS will be enforced
- HTTP requests will redirect to HTTPS

## Performance Optimization

### 1. Image Optimization

The project is configured with Next.js Image Optimization:

```javascript
// Automatic formats: WebP, AVIF
// Multiple device sizes supported
// Remote patterns configured for WordPress media
```

### 2. Caching Strategy

Vercel configuration includes optimized caching:

```json
// Static assets: 1 year cache
// Images: 1 year cache with immutable
// API routes: No cache (dynamic content)
// HTML pages: Cached with revalidation
```

### 3. Bundle Optimization

- Code splitting configured
- Tree shaking enabled
- Bundle analysis available via `pnpm build:analyze`

### 4. Performance Monitoring

```bash
# Enable Vercel Analytics (Pro plan required)
# Add to environment variables:
VERCEL_ANALYTICS_ID=your_analytics_id
VERCEL_SPEED_INSIGHTS_ID=your_speed_insights_id
```

## Security Configuration

### 1. Security Headers

Configured in `vercel.json`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content Security Policy
- Referrer Policy

### 2. Webhook Security

```env
# IP Whitelisting (recommended)
WEBHOOK_ALLOWED_IPS=your.server.ip.address,another.ip.address

# Rate Limiting
WEBHOOK_RATE_LIMIT_MAX=30
WEBHOOK_RATE_LIMIT_WINDOW=60000
```

### 3. Preview Mode Security

```env
# Secure preview mode
WORDPRESS_PREVIEW_SECRET=your-secure-preview-secret
```

## Monitoring & Analytics

### 1. WordPress Webhook Setup

Configure WordPress to send revalidation requests:

1. Install "WP Webhooks" plugin or add custom code:

```php
// Add to WordPress functions.php
add_action('save_post', 'trigger_nextjs_revalidation');
add_action('delete_post', 'trigger_nextjs_revalidation');

function trigger_nextjs_revalidation($post_id) {
    $webhook_url = 'https://your-site.vercel.app/api/revalidate';
    $secret = 'your-headless-secret';
    
    wp_remote_post($webhook_url, array(
        'body' => json_encode(['secret' => $secret]),
        'headers' => array('Content-Type' => 'application/json')
    ));
}
```

### 2. Error Monitoring

```bash
# View deployment logs
vercel logs your-deployment-url

# View function logs
vercel logs your-deployment-url --follow
```

### 3. Performance Monitoring

Monitor via Vercel Dashboard:
- Core Web Vitals
- Function execution time
- Bandwidth usage
- Error rates

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check build command
vercel-build: npm run build:full

# Verify dependencies
pnpm install --frozen-lockfile

# Check environment variables
vercel env ls
```

#### WordPress Connection Issues

```bash
# Test GraphQL endpoint
curl -X POST https://your-wp-site.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ generalSettings { title } }"}'

# Verify CORS settings in WordPress
# Add to WordPress functions.php:
add_action('init', function() {
    remove_action('rest_api_init', 'rest_default_additional_properties_to_zero_queries');
});
```

#### Environment Variable Issues

```bash
# List all environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local

# Validate environment
pnpm validate-env:production
```

#### Domain/SSL Issues

```bash
# Check domain status
vercel domains ls

# Verify DNS propagation
nslookup your-domain.com
dig your-domain.com

# Force SSL certificate renewal
vercel certs issue your-domain.com
```

### Debug Commands

```bash
# Local development with production environment
NODE_ENV=production pnpm dev

# Build with analysis
pnpm build:analyze

# Type checking
pnpm type-check

# Environment validation
pnpm validate-env:production
```

## Maintenance

### Regular Tasks

#### 1. Dependency Updates
```bash
# Check outdated packages
pnpm outdated

# Update dependencies
pnpm update

# Update Next.js
pnpm add next@latest
```

#### 2. Security Updates
```bash
# Audit dependencies
pnpm audit

# Fix vulnerabilities
pnpm audit fix
```

#### 3. Performance Monitoring
- Review Vercel Analytics monthly
- Monitor Core Web Vitals
- Check error rates and function performance
- Review bandwidth usage

#### 4. Content Sync
- Verify WordPress webhook functionality
- Test preview mode regularly
- Monitor revalidation performance

### Backup Strategy

#### 1. Code Backup
- Git repository serves as primary backup
- Tag releases: `git tag v1.0.0`
- Use GitHub/GitLab for remote backup

#### 2. Environment Backup
```bash
# Export environment variables
vercel env pull .env.backup

# Store securely (encrypted)
```

#### 3. Deployment Rollback
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback your-deployment-url
```

## Support

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [WPGraphQL Documentation](https://www.wpgraphql.com/docs/)

### Getting Help
- Check deployment logs: `vercel logs`
- Review build output for errors
- Test locally with: `pnpm build:production`
- Verify environment variables: `pnpm validate-env`

---

## Quick Deployment Checklist

- [ ] WordPress site configured with WPGraphQL
- [ ] Environment variables configured in Vercel
- [ ] Custom domain added and DNS configured
- [ ] SSL certificate issued
- [ ] Webhook revalidation tested
- [ ] Performance monitoring enabled
- [ ] Security headers verified
- [ ] Mobile responsiveness tested
- [ ] SEO metadata verified
- [ ] Analytics tracking confirmed

Your WordPress Next.js site should now be successfully deployed and optimized on Vercel!