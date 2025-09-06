import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    
    console.log(`📍 Checking application availability at ${baseURL}`);
    
    // Try to reach the homepage
    const response = await page.goto(baseURL, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    if (!response?.ok()) {
      throw new Error(`Application not ready at ${baseURL}. Status: ${response?.status()}`);
    }
    
    console.log('✅ Application is ready for E2E testing');
    
    // You can add additional setup here:
    // - Database seeding
    // - Authentication setup
    // - Mock data preparation
    
  } catch (error) {
    console.error('❌ E2E setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;