# Quick Start: Environment Configuration

**Get Your WordPress Next.js Site Running in 30 Minutes**

This is your complete checklist to get from zero to a working WordPress + Next.js headless site.

---

## ⚡ Quick Checklist (30 minutes total)

### **□ Phase 1: WordPress Backend (15 minutes)**
1. **□ Set up Cloudways hosting** ([detailed guide](./CLOUDWAYS_SETUP_GUIDE.md))
   - Sign up at cloudways.com (3-day free trial)
   - Choose WordPress + DigitalOcean + $10/month plan
   - Wait 5-10 minutes for server creation

2. **□ Install required WordPress plugins**
   - WPGraphQL (required)
   - WPGraphQL for ACF (recommended)
   - Yoast SEO (recommended)

3. **□ Get your WordPress URLs**
   - Your site: `https://your-app-name.cloudwaysapps.com`
   - Admin: `https://your-app-name.cloudwaysapps.com/wp-admin`
   - GraphQL: `https://your-app-name.cloudwaysapps.com/graphql`

### **□ Phase 2: Security Tokens (10 minutes)**
4. **□ Generate security tokens** ([detailed guide](./SECURITY_TOKEN_GUIDE.md))
   - HEADLESS_SECRET (64 characters)
   - GRAPHQL_JWT_AUTH_SECRET_KEY (64 characters)
   - PREVIEW_SECRET (32 characters)

5. **□ Create WordPress Application Password**
   - WordPress Admin → Users → Your Profile → Application Passwords
   - Name: "Next.js Headless Site"
   - Save the generated password (includes spaces)

### **□ Phase 3: Environment Setup (5 minutes)**
6. **□ Create .env.local file**
   - Copy `.env.example` to `.env.local`
   - Fill in all values (see template below)
   - Save the file

7. **□ Test your setup**
   - Restart: `pnpm dev`
   - Visit: `http://localhost:3000`
   - Check for errors in terminal

---

## 📋 .env.local Template

**Copy this template and replace ALL placeholder values:**

```env
# Frontend Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_WORDPRESS_API_URL=https://YOUR-APP-NAME.cloudwaysapps.com
NEXT_PUBLIC_WORDPRESS_API_HOSTNAME=YOUR-APP-NAME.cloudwaysapps.com

# Security Keys (Generate these using the Security Token Guide)
HEADLESS_SECRET=YOUR-64-CHARACTER-TOKEN-HERE
GRAPHQL_JWT_AUTH_SECRET_KEY=YOUR-64-CHARACTER-TOKEN-HERE

# WordPress Admin Credentials  
WP_USER=admin
WP_APP_PASS=YOUR-APPLICATION-PASSWORD-WITH-SPACES

# Preview Mode (Optional but recommended)
PREVIEW_SECRET=YOUR-32-CHARACTER-TOKEN-HERE
WORDPRESS_PREVIEW_SECRET=YOUR-32-CHARACTER-TOKEN-HERE

# Site Branding (Optional)
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description"
```

---

## 🔧 What Each Value Should Look Like

### **WordPress URLs (from Cloudways):**
```env
NEXT_PUBLIC_WORDPRESS_API_URL=https://mysite123.cloudwaysapps.com
NEXT_PUBLIC_WORDPRESS_API_HOSTNAME=mysite123.cloudwaysapps.com
```

### **Security Tokens (generated):**
```env
HEADLESS_SECRET=a1b2c3d4e5f6789012345abcdef67890123456789abcdef1234567890abcdef
GRAPHQL_JWT_AUTH_SECRET_KEY=9876543210abcdef1234567890abcdef1234567890abcdef9876543210abcdef
PREVIEW_SECRET=preview123secure456token789xyz
```

### **WordPress Credentials:**
```env
WP_USER=admin
WP_APP_PASS=1234 5678 9abc defg hijk lmno
```

---

## 🚀 Testing Your Setup

### **Step 1: Restart Development Server**
```bash
# Stop if running (Ctrl+C)
# Then restart:
pnpm dev
```

### **Step 2: Check Terminal Output**

**✅ Success looks like:**
```
✓ Ready in 2.1s  
- Local:    http://localhost:3000
- Network:  http://192.168.1.xxx:3000
```

**❌ Errors look like:**
```
Error: Required environment variable NEXT_PUBLIC_WORDPRESS_API_URL is not set
Error: NEXT_PUBLIC_WORDPRESS_API_URL environment variable is not set
```

### **Step 3: Test in Browser**

1. **Visit:** `http://localhost:3000`
2. **Expected:** Your Next.js site loads (may show placeholder content initially)
3. **If errors:** Check the terminal for specific error messages

### **Step 4: Verify WordPress Connection**

1. **Visit:** `https://your-wordpress-url.com/graphql`
2. **Expected:** GraphQL playground or API documentation
3. **If 404:** Make sure WPGraphQL plugin is active

---

## 🆘 Common Issues & Quick Fixes

### **Issue: "Environment variable missing"**
**Fix:** Check that `.env.local` exists in project root and contains all required variables

### **Issue: "ENOTFOUND" or connection errors**
**Fix:** Verify your WordPress URL is correct and the site is online

### **Issue: "Invalid credentials"**
**Fix:** Double-check WP_USER and WP_APP_PASS (including spaces in app password)

### **Issue: GraphQL endpoint returns 404**
**Fix:** Ensure WPGraphQL plugin is installed and activated in WordPress

### **Issue: "BlockRenderer is not defined"**
**Fix:** This is a known issue in the demo - you can fix code issues after getting the connection working

---

## 🎯 Success Criteria

**Your setup is working when:**

✅ **Terminal shows no environment variable errors**  
✅ **Development server starts without errors**  
✅ **http://localhost:3000 loads without connection errors**  
✅ **WordPress GraphQL endpoint responds (yoursite.com/graphql)**  
✅ **WordPress admin is accessible**  

---

## 📚 Detailed Guides

**If you need step-by-step instructions:**

- **[Cloudways Setup Guide](./CLOUDWAYS_SETUP_GUIDE.md)** - Complete WordPress hosting setup
- **[Security Token Guide](./SECURITY_TOKEN_GUIDE.md)** - Generate all required tokens
- **[Main README](./README.md)** - Full project documentation

---

## 💰 Cost Summary

**Free 3-Day Trial, then:**
- **Cloudways hosting:** $10-14/month
- **Domain (optional):** $10-15/year
- **SSL certificate:** Free (included)

**Total monthly cost:** $10-14

---

## ⏱️ Time Investment

- **Initial setup:** 30 minutes
- **Learning curve:** 1-2 hours
- **First deployment:** 1 hour
- **Ongoing maintenance:** 15 minutes/month

---

## 🎉 Next Steps After Success

1. **Add content in WordPress** - Create pages and posts to see them in Next.js
2. **Customize the design** - Modify components and styling
3. **Set up production deployment** - Deploy to Vercel or similar platform
4. **Configure custom domain** - Point your domain to the site
5. **Add advanced features** - Contact forms, SEO optimization, performance tuning

---

**Need help?** Check the detailed guides linked above or the troubleshooting sections in each guide.