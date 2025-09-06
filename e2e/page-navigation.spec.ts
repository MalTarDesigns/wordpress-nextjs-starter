import { test, expect } from '@playwright/test';

test.describe('Page Navigation', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/WordPress/);
    
    // Check for basic page structure
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check for no console errors (except warnings)
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Allow for some development warnings but no actual errors
    const criticalErrors = logs.filter(log => 
      !log.includes('Warning') && 
      !log.includes('DevTools') &&
      !log.includes('Extension')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should navigate to dynamic pages', async ({ page }) => {
    await page.goto('/');
    
    // Look for navigation links
    const navLinks = page.locator('nav a, header a').filter({ hasText: /home|about|blog|posts/i });
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // Test navigation to first available link
      const firstLink = navLinks.first();
      const linkText = await firstLink.textContent();
      const linkHref = await firstLink.getAttribute('href');
      
      if (linkHref && linkHref.startsWith('/') && linkHref !== '/') {
        await firstLink.click();
        
        // Wait for navigation
        await page.waitForURL(linkHref);
        await page.waitForLoadState('networkidle');
        
        // Verify we're on the correct page
        expect(page.url()).toContain(linkHref);
        
        // Check that the page loaded content
        const main = page.locator('main');
        await expect(main).toBeVisible();
      }
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Try to navigate to a non-existent page
    const response = await page.goto('/non-existent-page-12345', {
      waitUntil: 'networkidle'
    });
    
    // Should return 404 status
    expect(response?.status()).toBe(404);
    
    // Should still render a valid HTML page
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Should have some kind of error content
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Common 404 indicators
    const notFoundIndicators = [
      page.locator('text=404'),
      page.locator('text=Not Found'),
      page.locator('text=Page not found'),
      page.locator('[data-testid="404"]'),
      page.locator('.error-404')
    ];
    
    let foundIndicator = false;
    for (const indicator of notFoundIndicators) {
      if (await indicator.isVisible()) {
        foundIndicator = true;
        break;
      }
    }
    
    // At least one 404 indicator should be present
    expect(foundIndicator).toBeTruthy();
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that the page is responsive
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(500);
    
    // Check for mobile-specific elements or behaviors
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Ensure content fits in viewport (no horizontal scroll)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = viewport?.width || 375;
    
    // Allow for small differences due to scrollbars
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });

  test('should load with proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for essential meta tags
    const metaDescription = page.locator('meta[name="description"]');
    const metaViewport = page.locator('meta[name="viewport"]');
    const ogTitle = page.locator('meta[property="og:title"]');
    
    await expect(metaViewport).toBeAttached();
    
    // Meta description should exist (might be empty for dynamic sites)
    const hasMetaDescription = await metaDescription.count() > 0;
    const hasOgTitle = await ogTitle.count() > 0;
    
    // At least one form of meta information should be present
    expect(hasMetaDescription || hasOgTitle).toBeTruthy();
    
    // Check title exists and is not empty
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.context().route('**/*', async (route, request) => {
      // Add delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    await page.goto('/', { timeout: 30000 });
    
    // Even with slow network, page should eventually load
    const main = page.locator('main');
    await expect(main).toBeVisible({ timeout: 20000 });
    
    // Check that loading states are handled gracefully
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should work with JavaScript disabled', async ({ browser }) => {
    // Create a new context with JavaScript disabled
    const context = await browser.newContext({
      javaScriptEnabled: false
    });
    
    const page = await context.newPage();
    
    try {
      await page.goto('/');
      
      // Basic HTML should still render
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      
      // Check that basic content is visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
      
      // Navigation links should still work
      const links = page.locator('a[href^="/"]');
      const linkCount = await links.count();
      
      if (linkCount > 0) {
        const firstLink = links.first();
        const href = await firstLink.getAttribute('href');
        
        if (href && href !== '/') {
          await firstLink.click();
          
          // Should navigate without JavaScript
          await page.waitForURL(href, { timeout: 10000 });
          
          const newTitle = await page.title();
          expect(newTitle.length).toBeGreaterThan(0);
        }
      }
      
    } finally {
      await context.close();
    }
  });
});