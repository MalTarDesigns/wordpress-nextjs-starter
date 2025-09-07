import { type FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running E2E test teardown...');
  
  // Add cleanup logic here:
  // - Clear test data
  // - Reset database state
  // - Clean up generated files
  
  console.log('✅ E2E teardown completed');
}

export default globalTeardown;