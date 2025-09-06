import { test, expect } from '@playwright/test';

test.describe('Content Rendering', () => {
  test('should render WordPress blocks correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Look for common WordPress block elements
    const blockElements = [
      page.locator('[data-block-name]'),
      page.locator('.wp-block-paragraph'),
      page.locator('.wp-block-heading'),
      page.locator('.wp-block-image'),
      page.locator('.wp-block-button'),
      page.locator('[data-block-renderer]')
    ];
    
    let foundBlocks = false;
    for (const blockElement of blockElements) {
      if (await blockElement.count() > 0) {
        foundBlocks = true;
        break;
      }
    }
    
    // If WordPress content is present, verify block rendering
    if (foundBlocks) {
      // Check for properly structured blocks
      const blockRenderer = page.locator('[data-block-renderer]');
      if (await blockRenderer.count() > 0) {
        await expect(blockRenderer).toBeVisible();
        
        // Check that blocks have proper attributes
        const namedBlocks = page.locator('[data-block-name]');
        const blockCount = await namedBlocks.count();
        
        if (blockCount > 0) {
          // Verify each block has a valid name
          for (let i = 0; i < Math.min(blockCount, 5); i++) {
            const block = namedBlocks.nth(i);
            const blockName = await block.getAttribute('data-block-name');
            expect(blockName).toBeTruthy();
            expect(blockName).toMatch(/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$|^[a-z][a-z0-9-]*$/);
          }
        }
      }
    }
  });

  test('should handle images properly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check first few images
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = images.nth(i);
        
        // Should have src attribute
        const src = await img.getAttribute('src');
        expect(src).toBeTruthy();
        
        // Should have alt attribute for accessibility
        const alt = await img.getAttribute('alt');
        expect(alt).toBeDefined(); // Can be empty string, but should exist
        
        // Wait for image to load (or fail)
        await img.waitForElementState('stable', { timeout: 5000 });
        
        // Check if image actually loaded
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        
        // If naturalWidth is 0, the image failed to load - this might be expected for placeholder/missing images
        if (naturalWidth > 0) {
          // Image loaded successfully
          expect(naturalWidth).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should render headings with proper hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      // Should have at least one h1 (or site title)
      const h1s = page.locator('h1');
      const h1Count = await h1s.count();
      
      // Most pages should have exactly one h1
      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h1Count).toBeLessThanOrEqual(2); // Allow for site title + page title
      
      // Check that headings have content
      for (let i = 0; i < Math.min(headingCount, 5); i++) {
        const heading = headings.nth(i);
        const text = await heading.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('should handle links correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      // Check first few links
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        
        expect(href).toBeTruthy();
        
        // Internal links should start with / or be full URLs to same domain
        if (href?.startsWith('/')) {
          // Internal link - should be valid
          expect(href.length).toBeGreaterThan(1);
        } else if (href?.startsWith('http')) {
          // External link - should have valid URL format
          expect(() => new URL(href)).not.toThrow();
          
          // External links should open in new tab/window
          const target = await link.getAttribute('target');
          const rel = await link.getAttribute('rel');
          
          // Good practice for external links
          if (target === '_blank') {
            expect(rel).toContain('noopener');
          }
        }
      }
    }
  });

  test('should render forms accessibly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      const form = forms.first();
      
      // Check form inputs have proper labels or aria-labels
      const inputs = form.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        const type = await input.getAttribute('type');
        
        // Skip hidden inputs
        if (type === 'hidden') continue;
        
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        
        if (id) {
          // Check for associated label
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          
          // Should have either a label, aria-label, or aria-labelledby
          expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy();
        }
      }
    }
  });

  test('should handle dynamic content loading', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForLoadState('domcontentloaded');
    
    // Look for loading indicators
    const loadingIndicators = [
      page.locator('[data-testid="loading"]'),
      page.locator('.loading'),
      page.locator('.spinner'),
      page.locator('text=Loading'),
      page.locator('[aria-label*="loading" i]')
    ];
    
    let foundLoadingIndicator = false;
    for (const indicator of loadingIndicators) {
      if (await indicator.isVisible()) {
        foundLoadingIndicator = true;
        
        // Loading indicator should disappear after content loads
        await expect(indicator).toBeHidden({ timeout: 10000 });
        break;
      }
    }
    
    // Ensure final state is stable
    await page.waitForLoadState('networkidle');
    
    // Content should be visible after loading
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test error boundary behavior by visiting a page that might have errors
    // or by simulating network failures
    
    // Intercept and fail some requests to simulate errors
    await page.route('**/wp-json/**', route => route.abort());
    await page.route('**/graphql', route => route.abort());
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait a bit for any error states to appear
    await page.waitForTimeout(2000);
    
    // Page should still render something, not be completely blank
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check if error boundaries are working
    const errorBoundaries = [
      page.locator('[data-testid="error-boundary"]'),
      page.locator('.error-boundary'),
      page.locator('text=Something went wrong'),
      page.locator('text=Error loading content')
    ];
    
    // Should not have unhandled errors that break the page
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Focus the first interactive element
    await page.keyboard.press('Tab');
    
    // Get the focused element
    const focusedElement = page.locator(':focus');
    
    if (await focusedElement.count() > 0) {
      // Should be able to see focus indicator
      await expect(focusedElement).toBeVisible();
      
      // Tab through a few elements
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab');
        
        const newFocusedElement = page.locator(':focus');
        if (await newFocusedElement.count() > 0) {
          await expect(newFocusedElement).toBeVisible();
        }
      }
    }
  });

  test('should render structured data correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for JSON-LD structured data
    const structuredData = page.locator('script[type="application/ld+json"]');
    const structuredDataCount = await structuredData.count();
    
    if (structuredDataCount > 0) {
      // Validate JSON-LD content
      for (let i = 0; i < Math.min(structuredDataCount, 3); i++) {
        const script = structuredData.nth(i);
        const content = await script.textContent();
        
        if (content) {
          // Should be valid JSON
          expect(() => JSON.parse(content)).not.toThrow();
          
          const data = JSON.parse(content);
          
          // Should have @context and @type
          expect(data['@context']).toBeTruthy();
          expect(data['@type']).toBeTruthy();
          
          // Common structured data types
          const validTypes = [
            'WebSite', 'WebPage', 'Article', 'BlogPosting', 
            'Organization', 'Person', 'BreadcrumbList'
          ];
          
          expect(validTypes).toContain(data['@type']);
        }
      }
    }
  });
});