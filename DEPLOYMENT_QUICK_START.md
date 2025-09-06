# Quick Start Deployment Guide

## 🚀 Deploy to Vercel in 10 Minutes

### Prerequisites Checklist
- [ ] WordPress site with WPGraphQL plugin installed
- [ ] Vercel account created
- [ ] Git repository with your code
- [ ] Domain ready (optional)

### Step 1: Environment Setup (2 minutes)

1. **Copy environment template:**
   ```bash
   cp .env.vercel.example .env.local
   ```

2. **Configure required variables in `.env.local`:**
   ```env
   NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com
   NEXT_PUBLIC_WORDPRESS_API_HOSTNAME=your-wordpress-site.com
   NEXT_PUBLIC_BASE_URL=https://your-site.vercel.app
   HEADLESS_SECRET=your-64-character-secret-here
   ```

3. **Generate secure secret:**
   ```bash
   # On Mac/Linux:
   openssl rand -hex 32
   
   # On Windows PowerShell:
   [System.Web.Security.Membership]::GeneratePassword(64, 0)
   
   # Or use online generator: https://passwordsgenerator.net/
   ```

### Step 2: Local Testing (2 minutes)

```bash
# Install dependencies
pnpm install

# Validate environment
pnpm validate-env

# Test build
pnpm build:full

# Test locally
pnpm start
```

### Step 3: Deploy with Script (3 minutes)

**Option A: Automated Script**
```bash
# Make script executable (Mac/Linux)
chmod +x scripts/deploy.sh

# Deploy to preview
./scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh production
```

**Option B: Windows**
```cmd
scripts\deploy.bat
```

**Option C: Manual Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Step 4: Vercel Configuration (2 minutes)

1. **Go to Vercel Dashboard → Your Project → Settings**

2. **Environment Variables:**
   - Add all variables from your `.env.local`
   - Set environment: Production, Preview, Development as needed

3. **Build Settings:**
   - Framework: Next.js ✅
   - Build Command: `pnpm build:full`
   - Output Directory: `.next`
   - Install Command: `pnpm install --frozen-lockfile`

### Step 5: Domain Setup (1 minute)

1. **Add Domain:**
   ```bash
   vercel domains add your-domain.com
   ```

2. **Update DNS at your registrar:**
   ```dns
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

3. **Update environment variables:**
   ```env
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   ```

## ✅ Deployment Checklist

### Before Deployment
- [ ] WordPress site accessible and GraphQL endpoint working
- [ ] Environment variables configured
- [ ] Local build successful
- [ ] TypeScript compilation passes
- [ ] ESLint passes

### After Deployment
- [ ] Site loads correctly
- [ ] WordPress content displays
- [ ] Images load from WordPress
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Performance score acceptable

### WordPress Webhook (Optional)
- [ ] Configure revalidation webhook in WordPress
- [ ] Test content updates trigger revalidation

## 🔧 Common Issues & Solutions

### Build Fails
```bash
# Clear cache and rebuild
pnpm clean
pnpm install --frozen-lockfile
pnpm build:full
```

### Environment Variables Not Working
```bash
# Check variables are set correctly
vercel env ls

# Pull variables locally to test
vercel env pull .env.local
```

### WordPress Connection Issues
- Verify GraphQL endpoint: `https://your-wp-site.com/graphql`
- Check CORS settings in WordPress
- Ensure WPGraphQL plugin is active and updated

### Domain/SSL Issues
- DNS propagation can take up to 24 hours
- Use DNS checker: https://dnschecker.org
- SSL certificates are automatic with Vercel

## 📞 Support Commands

```bash
# View deployment logs
vercel logs

# Check domain status  
vercel domains ls

# List environment variables
vercel env ls

# Rollback deployment
vercel rollback

# Check build output
pnpm build:analyze
```

## 🎯 Performance Optimization

### Automatic Optimizations Included
- ✅ Image optimization (WebP, AVIF)
- ✅ Code splitting and tree shaking
- ✅ Static asset caching (1 year)
- ✅ Gzip compression
- ✅ Security headers
- ✅ Bundle analysis available

### Additional Optimizations
- Enable Vercel Analytics (Pro plan)
- Configure WordPress caching plugin
- Use CDN for WordPress media
- Optimize images before upload

## 🔐 Security Features Included

- ✅ Security headers (CSP, XSS protection)
- ✅ Webhook security with secrets
- ✅ Rate limiting for API endpoints
- ✅ WordPress admin route blocking
- ✅ HTTPS enforcement
- ✅ Preview mode security

---

## Need Help?

1. **Check logs first:** `vercel logs your-deployment-url`
2. **Review full documentation:** [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Test locally:** `pnpm build:production && pnpm start`
4. **Validate environment:** `pnpm validate-env`

**Estimated Total Time: 10 minutes**
**Recommended for production: Add custom domain and configure monitoring**