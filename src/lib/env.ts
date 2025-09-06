/**
 * Environment Variable Validation and Configuration
 * Ensures required WordPress integration variables are properly set
 */

import type { RequiredEnvVars, OptionalEnvVars, EnvValidationError, ValidateEnv } from '@/types/env';

// Required environment variables
const REQUIRED_ENV_VARS: Array<keyof RequiredEnvVars> = [
  'NEXT_PUBLIC_WORDPRESS_API_URL',
  'NEXT_PUBLIC_WORDPRESS_API_HOSTNAME',
  'NEXT_PUBLIC_BASE_URL',
  'HEADLESS_SECRET',
];

// Optional environment variables with defaults
const DEFAULT_VALUES: Partial<OptionalEnvVars> = {
  NEXT_PUBLIC_SITE_NAME: 'WordPress Site',
  NEXT_PUBLIC_SITE_DESCRIPTION: 'A modern WordPress site built with Next.js',
  NEXT_PUBLIC_LOCALE: 'en_US',
};

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

/**
 * Validates a URL string
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return URL_REGEX.test(url);
  } catch {
    return false;
  }
}

/**
 * Validates a hostname string
 */
function isValidHostname(hostname: string): boolean {
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  return hostnameRegex.test(hostname);
}

/**
 * Main environment validation function
 */
export const validateEnv: ValidateEnv = () => {
  const errors: EnvValidationError[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    
    if (!value) {
      errors.push({
        variable: envVar,
        message: `${envVar} is required but not set`,
      });
      continue;
    }

    // Additional validation for specific variables
    switch (envVar) {
      case 'NEXT_PUBLIC_WORDPRESS_API_URL':
        if (!isValidUrl(value)) {
          errors.push({
            variable: envVar,
            message: `${envVar} must be a valid URL`,
          });
        }
        break;
        
      case 'NEXT_PUBLIC_WORDPRESS_API_HOSTNAME':
        if (!isValidHostname(value)) {
          errors.push({
            variable: envVar,
            message: `${envVar} must be a valid hostname`,
          });
        }
        break;
        
      case 'NEXT_PUBLIC_BASE_URL':
        if (!isValidUrl(value)) {
          errors.push({
            variable: envVar,
            message: `${envVar} must be a valid URL`,
          });
        }
        break;
        
      case 'HEADLESS_SECRET':
        if (value.length < 32) {
          errors.push({
            variable: envVar,
            message: `${envVar} should be at least 32 characters long for security`,
          });
        }
        break;
    }
  }

  // Check optional but recommended variables
  if (!process.env.WP_USER || !process.env.WP_APP_PASS) {
    warnings.push('WP_USER and WP_APP_PASS are not set. WordPress redirect functionality will be disabled.');
  }

  if (!process.env.WORDPRESS_PREVIEW_SECRET) {
    warnings.push('WORDPRESS_PREVIEW_SECRET is not set. Preview functionality may be less secure.');
  }

  if (!process.env.NEXT_PUBLIC_SITE_NAME) {
    warnings.push('NEXT_PUBLIC_SITE_NAME is not set. Using default value.');
  }

  // Validate URL consistency
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  const hostname = process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME;
  
  if (baseUrl && wpUrl && hostname) {
    try {
      const wpUrlObj = new URL(wpUrl);
      if (wpUrlObj.hostname !== hostname) {
        warnings.push('NEXT_PUBLIC_WORDPRESS_API_HOSTNAME does not match the hostname in NEXT_PUBLIC_WORDPRESS_API_URL');
      }
    } catch {
      // Already handled in URL validation above
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Gets environment variable with fallback to default
 */
export function getEnvVar<K extends keyof OptionalEnvVars>(
  key: K,
  fallback?: OptionalEnvVars[K]
): OptionalEnvVars[K] {
  return process.env[key] ?? fallback ?? DEFAULT_VALUES[key];
}

/**
 * Gets required environment variable or throws error
 */
export function getRequiredEnvVar<K extends keyof RequiredEnvVars>(
  key: K
): RequiredEnvVars[K] {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value as RequiredEnvVars[K];
}

/**
 * Environment configuration object with validated values
 */
export const envConfig = {
  // WordPress Configuration
  wordpress: {
    apiUrl: getRequiredEnvVar('NEXT_PUBLIC_WORDPRESS_API_URL'),
    hostname: getRequiredEnvVar('NEXT_PUBLIC_WORDPRESS_API_HOSTNAME'),
    user: getEnvVar('WP_USER'),
    appPass: getEnvVar('WP_APP_PASS'),
    previewSecret: getEnvVar('WORDPRESS_PREVIEW_SECRET'),
  },
  
  // Site Configuration
  site: {
    baseUrl: getRequiredEnvVar('NEXT_PUBLIC_BASE_URL'),
    name: getEnvVar('NEXT_PUBLIC_SITE_NAME'),
    description: getEnvVar('NEXT_PUBLIC_SITE_DESCRIPTION'),
    locale: getEnvVar('NEXT_PUBLIC_LOCALE'),
  },
  
  // Security
  security: {
    headlessSecret: getRequiredEnvVar('HEADLESS_SECRET'),
  },
  
  // Social Media
  social: {
    twitterHandle: getEnvVar('NEXT_PUBLIC_TWITTER_HANDLE'),
    facebookAppId: getEnvVar('NEXT_PUBLIC_FACEBOOK_APP_ID'),
  },
  
  // Analytics
  analytics: {
    gaId: getEnvVar('NEXT_PUBLIC_GA_MEASUREMENT_ID'),
    gtmId: getEnvVar('NEXT_PUBLIC_GTM_ID'),
  },
  
  // Build and Development
  build: {
    nodeEnv: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    analyze: Boolean(process.env.ANALYZE),
  },
} as const;

/**
 * Validates environment on startup
 * Should be called in layout.tsx or _app.tsx
 */
export function validateEnvOnStartup(): void {
  if (typeof window !== 'undefined') {
    // Skip validation on client side
    return;
  }

  const validation = validateEnv();
  
  if (!validation.isValid) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => {
      console.error(`  - ${error.variable}: ${error.message}`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration. Check the logs above.');
    }
  } else {
    console.log('✅ Environment validation passed');
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    validation.warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
  }
}

/**
 * Type guard to check if we're in production
 */
export const isProduction = (): boolean => envConfig.build.isProduction;

/**
 * Type guard to check if we're in development
 */
export const isDevelopment = (): boolean => envConfig.build.isDevelopment;

/**
 * Get WordPress GraphQL endpoint URL
 */
export const getWordPressGraphQLUrl = (): string => {
  return `${envConfig.wordpress.apiUrl}/graphql`;
};

/**
 * Get WordPress REST API endpoint URL
 */
export const getWordPressRestUrl = (): string => {
  return `${envConfig.wordpress.apiUrl}/wp-json/wp/v2`;
};

/**
 * Check if WordPress authentication is configured
 */
export const hasWordPressAuth = (): boolean => {
  return Boolean(envConfig.wordpress.user && envConfig.wordpress.appPass);
};

/**
 * Check if preview mode is properly configured
 */
export const hasPreviewConfig = (): boolean => {
  return Boolean(envConfig.wordpress.previewSecret);
};