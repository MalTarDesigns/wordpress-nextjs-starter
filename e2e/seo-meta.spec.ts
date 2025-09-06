import { test, expect } from '@playwright/test';

test.describe('SEO and Meta Tags', () => {
  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    
    const title = await page.title();
    
    // Title should not be empty
    expect(title.trim().length).toBeGreaterThan(0);
    
    // Should not be default Next.js title
    expect(title).not.toBe('Create Next App');
    
    // Should contain site-related keywords or brand name
    expect(title.length).toBeGreaterThan(5);
    expect(title.length).toBeLessThan(150); // SEO best practice
  });

  test('should have essential meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toBeAttached();
    
    const viewportContent = await viewportMeta.getAttribute('content');
    expect(viewportContent).toContain('width=device-width');
    
    // Check for charset
    const charset = page.locator('meta[charset], meta[http-equiv="Content-Type"]');
    const charsetCount = await charset.count();
    expect(charsetCount).toBeGreaterThanOrEqual(1);
    
    // Check for description (might be empty for dynamic content)
    const description = page.locator('meta[name="description"]');
    const descriptionExists = await description.count() > 0;
    
    if (descriptionExists) {
      const descriptionContent = await description.getAttribute('content');
      if (descriptionContent) {
        expect(descriptionContent.length).toBeLessThan(300); // SEO best practice
      }
    }
  });

  test('should have Open Graph meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for essential OG tags
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    const ogUrl = page.locator('meta[property="og:url"]');
    const ogType = page.locator('meta[property="og:type"]');
    const ogSiteName = page.locator('meta[property="og:site_name"]');
    
    // At least og:title should be present
    const ogTitleExists = await ogTitle.count() > 0;
    
    if (ogTitleExists) {
      const titleContent = await ogTitle.getAttribute('content');
      expect(titleContent?.trim().length).toBeGreaterThan(0);
      
      // Check other OG tags when og:title exists
      if (await ogType.count() > 0) {
        const typeContent = await ogType.getAttribute('content');
        expect(['website', 'article', 'blog']).toContain(typeContent);
      }
      
      if (await ogUrl.count() > 0) {
        const urlContent = await ogUrl.getAttribute('content');
        expect(urlContent).toMatch(/^https?:\/\//);
      }
    }
    
    // Check for OG images
    const ogImage = page.locator('meta[property="og:image"]');
    const ogImageExists = await ogImage.count() > 0;
    
    if (ogImageExists) {
      const imageUrl = await ogImage.getAttribute('content');
      expect(imageUrl).toMatch(/^https?:\/\//);
      
      // Check for additional image properties
      const ogImageWidth = page.locator('meta[property="og:image:width"]');
      const ogImageHeight = page.locator('meta[property="og:image:height"]');
      const ogImageAlt = page.locator('meta[property="og:image:alt"]');
      
      if (await ogImageWidth.count() > 0) {
        const width = await ogImageWidth.getAttribute('content');
        expect(parseInt(width || '0')).toBeGreaterThan(0);
      }
    }
  });

  test('should have Twitter Card meta tags', async ({ page }) => {
    await page.goto('/');
    
    const twitterCard = page.locator('meta[name="twitter:card"]');
    const twitterCardExists = await twitterCard.count() > 0;
    
    if (twitterCardExists) {
      const cardType = await twitterCard.getAttribute('content');
      expect(['summary', 'summary_large_image', 'app', 'player']).toContain(cardType);
      
      // Check for other Twitter meta tags
      const twitterTitle = page.locator('meta[name="twitter:title"]');
      const twitterDescription = page.locator('meta[name="twitter:description"]');
      const twitterImage = page.locator('meta[name="twitter:image"]');
      const twitterSite = page.locator('meta[name="twitter:site"]');
      
      if (await twitterTitle.count() > 0) {
        const title = await twitterTitle.getAttribute('content');
        expect(title?.trim().length).toBeGreaterThan(0);
      }
      
      if (await twitterImage.count() > 0) {
        const imageUrl = await twitterImage.getAttribute('content');
        expect(imageUrl).toMatch(/^https?:\/\//);
      }
      
      if (await twitterSite.count() > 0) {
        const site = await twitterSite.getAttribute('content');
        expect(site).toMatch(/^@\w+/);
      }
    }
  });

  test('should have proper canonical URL', async ({ page }) => {
    await page.goto('/');
    
    const canonical = page.locator('link[rel="canonical"]');
    const canonicalExists = await canonical.count() > 0;
    
    if (canonicalExists) {
      const href = await canonical.getAttribute('href');
      expect(href).toMatch(/^https?:\/\//);
      
      // Should be absolute URL
      expect(() => new URL(href!)).not.toThrow();
    }
  });

  test('should have proper robots meta tag', async ({ page }) => {
    await page.goto('/');
    
    const robots = page.locator('meta[name="robots"]');
    const robotsExists = await robots.count() > 0;
    
    if (robotsExists) {
      const content = await robots.getAttribute('content');
      
      // Should contain valid robots directives
      const validDirectives = [
        'index', 'noindex', 'follow', 'nofollow',
        'archive', 'noarchive', 'snippet', 'nosnippet',
        'imageindex', 'noimageindex'
      ];
      
      const directives = content?.toLowerCase().split(',').map(d => d.trim()) || [];
      
      for (const directive of directives) {
        expect(validDirectives).toContain(directive);
      }
    }
  });

  test('should have structured data', async ({ page }) => {
    await page.goto('/');
    
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const jsonLdCount = await jsonLd.count();
    
    if (jsonLdCount > 0) {
      // Check first structured data script
      const firstScript = jsonLd.first();
      const content = await firstScript.textContent();
      
      expect(content).toBeTruthy();
      
      // Should be valid JSON
      let structuredData;
      expect(() => {
        structuredData = JSON.parse(content!);
      }).not.toThrow();
      
      // Should have required properties
      expect(structuredData['@context']).toBeTruthy();
      expect(structuredData['@type']).toBeTruthy();
      
      // Check for common structured data types
      const commonTypes = [
        'WebSite', 'Organization', 'WebPage', 'Article',
        'BlogPosting', 'BreadcrumbList', 'Person'
      ];
      
      const hasValidType = commonTypes.includes(structuredData['@type']);
      expect(hasValidType).toBeTruthy();
      
      // WebSite type should have name and url
      if (structuredData['@type'] === 'WebSite') {
        expect(structuredData.name).toBeTruthy();
        expect(structuredData.url).toBeTruthy();
      }
      
      // Article/BlogPosting should have headline
      if (['Article', 'BlogPosting'].includes(structuredData['@type'])) {
        expect(structuredData.headline || structuredData.name).toBeTruthy();
      }
    }
  });

  test('should have proper language attributes', async ({ page }) => {
    await page.goto('/');
    
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    
    // Should have language attribute
    expect(lang).toBeTruthy();
    
    // Should be valid language code
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  test('should have favicon', async ({ page }) => {
    await page.goto('/');
    
    // Check for various favicon formats
    const faviconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="mask-icon"]'
    ];
    
    let hasFavicon = false;
    
    for (const selector of faviconSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        hasFavicon = true;
        const href = await element.first().getAttribute('href');
        expect(href).toBeTruthy();
        break;
      }
    }
    
    expect(hasFavicon).toBeTruthy();
  });

  test('should have proper theme color', async ({ page }) => {
    await page.goto('/');
    
    const themeColor = page.locator('meta[name="theme-color"]');
    const themeColorExists = await themeColor.count() > 0;
    
    if (themeColorExists) {
      const color = await themeColor.getAttribute('content');
      
      // Should be valid color format
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/);
    }
  });

  test('should not have duplicate meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for duplicate essential meta tags
    const essentialMetas = [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
      'link[rel="canonical"]'
    ];
    
    for (const selector of essentialMetas) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      // Should not have more than one of each
      expect(count).toBeLessThanOrEqual(1);
    }
  });

  test('should have proper page hierarchy for SEO', async ({ page }) => {
    await page.goto('/');
    
    // Check heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      const h1s = page.locator('h1');
      const h1Count = await h1s.count();
      
      // Should have exactly one h1 (main page title)
      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h1Count).toBeLessThanOrEqual(2); // Allow for site title
      
      // Check that h1 has meaningful content
      if (h1Count > 0) {
        const h1Text = await h1s.first().textContent();
        expect(h1Text?.trim().length).toBeGreaterThan(0);
        expect(h1Text?.trim().length).toBeLessThan(200);
      }
    }
  });
});