/**
 * Environment Variables Type Definitions
 * Enhanced type safety for WordPress Next.js integration
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // WordPress API Configuration (Required)
      NEXT_PUBLIC_WORDPRESS_API_URL: string;
      NEXT_PUBLIC_WORDPRESS_API_HOSTNAME: string;
      
      // Site Configuration (Required)
      NEXT_PUBLIC_BASE_URL: string;
      
      // WordPress Authentication (Optional)
      WP_USER?: string;
      WP_APP_PASS?: string;
      
      // Next.js Configuration
      NODE_ENV: 'development' | 'production' | 'test';
      
      // Headless CMS Integration
      HEADLESS_SECRET: string;
      WORDPRESS_PREVIEW_SECRET?: string;
      
      // Site Metadata (Optional)
      NEXT_PUBLIC_SITE_NAME?: string;
      NEXT_PUBLIC_SITE_DESCRIPTION?: string;
      NEXT_PUBLIC_LOCALE?: string;
      
      // Social Media Integration (Optional)
      NEXT_PUBLIC_TWITTER_HANDLE?: string;
      NEXT_PUBLIC_FACEBOOK_APP_ID?: string;
      
      // Analytics and Tracking (Optional)
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
      NEXT_PUBLIC_GTM_ID?: string;
      
      // Performance and Optimization (Optional)
      ANALYZE?: string;
      BUNDLE_ANALYZE?: string;
      
      // Database and Cache (Optional)
      DATABASE_URL?: string;
      REDIS_URL?: string;
      
      // Email Configuration (Optional)
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;
      
      // Security and CORS (Optional)
      ALLOWED_ORIGINS?: string;
      CORS_CREDENTIALS?: string;
      
      // Error Reporting (Optional)
      SENTRY_DSN?: string;
      SENTRY_AUTH_TOKEN?: string;
      SENTRY_PROJECT?: string;
      SENTRY_ORG?: string;
      
      // Build and Deployment (Optional)
      VERCEL?: string;
      VERCEL_URL?: string;
      NETLIFY?: string;
      
      // Development Tools (Optional)
      ENABLE_EXPERIMENTAL_COREPACK?: string;
      SKIP_ENV_VALIDATION?: string;
      
      // Custom WordPress Fields (Optional)
      NEXT_PUBLIC_WORDPRESS_UPLOADS_URL?: string;
      WORDPRESS_GRAPHQL_ENDPOINT?: string;
      WORDPRESS_REST_API_URL?: string;
    }
  }
}

// Export types for use in components
export interface RequiredEnvVars {
  NEXT_PUBLIC_WORDPRESS_API_URL: string;
  NEXT_PUBLIC_WORDPRESS_API_HOSTNAME: string;
  NEXT_PUBLIC_BASE_URL: string;
  HEADLESS_SECRET: string;
}

export interface OptionalEnvVars {
  WP_USER?: string;
  WP_APP_PASS?: string;
  WORDPRESS_PREVIEW_SECRET?: string;
  NEXT_PUBLIC_SITE_NAME?: string;
  NEXT_PUBLIC_SITE_DESCRIPTION?: string;
  NEXT_PUBLIC_LOCALE?: string;
  NEXT_PUBLIC_TWITTER_HANDLE?: string;
  NEXT_PUBLIC_FACEBOOK_APP_ID?: string;
  NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
  NEXT_PUBLIC_GTM_ID?: string;
}

// Environment validation utility type
export type EnvValidationError = {
  variable: keyof RequiredEnvVars;
  message: string;
};

// Environment validation function type
export type ValidateEnv = () => {
  isValid: boolean;
  errors: EnvValidationError[];
  warnings: string[];
};

export {};