import type { 
  WebhookSecurityConfig, 
  RateLimitConfig,
  RevalidationStrategy 
} from '@/types/wordpress';

export interface WebhookConfig {
  security: WebhookSecurityConfig;
  rateLimit: RateLimitConfig;
  revalidation: RevalidationStrategy;
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    includePayload: boolean;
    maxEntries: number;
  };
}

export class WebhookConfigManager {
  private static instance: WebhookConfigManager | null = null;
  private config: WebhookConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): WebhookConfigManager {
    if (!WebhookConfigManager.instance) {
      WebhookConfigManager.instance = new WebhookConfigManager();
    }
    return WebhookConfigManager.instance;
  }

  private loadConfig(): WebhookConfig {
    const envConfig = this.loadFromEnvironment();
    const defaultConfig = this.getDefaultConfig();
    
    return this.mergeConfigs(defaultConfig, envConfig);
  }

  private loadFromEnvironment(): Partial<WebhookConfig> {
    const env = process.env;
    
    return {
      security: {
        secretToken: env.HEADLESS_SECRET || '',
        allowedIPs: env.WEBHOOK_ALLOWED_IPS?.split(',').map(ip => ip.trim()),
        rateLimitMaxRequests: parseInt(env.WEBHOOK_RATE_LIMIT_MAX || '30', 10),
        rateLimitWindowMs: parseInt(env.WEBHOOK_RATE_LIMIT_WINDOW || '60000', 10),
      },
      logging: {
        enabled: env.WEBHOOK_LOG_ENABLED !== 'false',
        level: (env.WEBHOOK_LOG_LEVEL as any) || 'info',
        includePayload: env.WEBHOOK_LOG_INCLUDE_PAYLOAD !== 'false',
        maxEntries: parseInt(env.WEBHOOK_LOG_MAX_ENTRIES || '2000', 10),
      },
    };
  }

  private getDefaultConfig(): WebhookConfig {
    return {
      security: {
        secretToken: '',
        allowedIPs: undefined,
        rateLimitMaxRequests: 30,
        rateLimitWindowMs: 60000, // 1 minute
      },
      rateLimit: {
        windowMs: 60000, // 1 minute
        maxRequests: 30,
        blockDurationMs: 900000, // 15 minutes
        skipSuccessfulRequests: false,
      },
      revalidation: {
        immediate: [
          {
            contentType: 'post',
            pattern: '/posts/:slug',
            pathGenerator: (content) => {
              const paths = [];
              if (content.slug) {
                paths.push(`/posts/${content.slug}`);
                paths.push(`/blog/${content.slug}`);
              }
              if (content.id) {
                paths.push(`/posts/${content.id}`);
              }
              return paths;
            },
            tags: ['posts', 'blog'],
          },
          {
            contentType: 'page',
            pattern: '/:slug',
            pathGenerator: (content) => {
              const paths = [];
              if (content.slug) {
                if (content.slug === 'home' || content.slug === 'index') {
                  paths.push('/');
                } else {
                  paths.push(`/${content.slug}`);
                }
              }
              if (content.id) {
                paths.push(`/pages/${content.id}`);
              }
              return paths;
            },
            tags: ['pages'],
          },
          {
            contentType: 'all',
            pattern: '/sitemap',
            pathGenerator: () => ['/sitemap.xml', '/robots.txt'],
            tags: ['sitemap', 'seo'],
          },
        ],
        deferred: [
          {
            contentType: 'post',
            pattern: '/category/:category',
            pathGenerator: (content) => {
              const categories = content.categories || content.metadata?.categories || [];
              return Array.isArray(categories) 
                ? categories.map((cat: string) => `/category/${cat.toLowerCase().replace(/\s+/g, '-')}`)
                : [];
            },
            tags: ['categories', 'archives'],
          },
          {
            contentType: 'post',
            pattern: '/tag/:tag',
            pathGenerator: (content) => {
              const tags = content.tags || content.metadata?.tags || [];
              return Array.isArray(tags) 
                ? tags.map((tag: string) => `/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`)
                : [];
            },
            tags: ['post-tags', 'archives'],
          },
          {
            contentType: 'post',
            pattern: '/author/:author',
            pathGenerator: (content) => {
              if (content.authorSlug || content.metadata?.authorSlug) {
                return [`/author/${content.authorSlug || content.metadata.authorSlug}`];
              }
              return [];
            },
            tags: ['authors'],
          },
        ],
        cascade: [
          {
            contentType: 'all',
            pattern: '/feeds',
            pathGenerator: (content) => {
              // Always revalidate feeds when content changes
              return ['/feed', '/rss.xml', '/atom.xml', '/feed.json'];
            },
            tags: ['feeds', 'rss'],
          },
          {
            contentType: 'all',
            pattern: '/homepage',
            pathGenerator: (content) => {
              // Revalidate homepage for major content changes
              if (content.action === 'publish' || content.action === 'delete') {
                return ['/'];
              }
              return [];
            },
            tags: ['homepage'],
          },
          {
            contentType: 'page',
            pattern: '/navigation',
            pathGenerator: (content) => {
              // Revalidate navigation when pages change
              const paths = ['/']; // Always include homepage
              
              // Add common navigation pages
              const navPages = ['about', 'contact', 'services', 'products'];
              navPages.forEach(page => paths.push(`/${page}`));
              
              return paths;
            },
            tags: ['navigation', 'menu'],
          },
          {
            contentType: 'all',
            pattern: '/search',
            pathGenerator: (content) => {
              if (content.action === 'publish' || content.action === 'delete') {
                return ['/search'];
              }
              return [];
            },
            tags: ['search'],
          },
        ],
      },
      logging: {
        enabled: true,
        level: 'info',
        includePayload: true,
        maxEntries: 2000,
      },
    };
  }

  private mergeConfigs(defaultConfig: WebhookConfig, envConfig: Partial<WebhookConfig>): WebhookConfig {
    return {
      security: { ...defaultConfig.security, ...envConfig.security },
      rateLimit: { ...defaultConfig.rateLimit, ...envConfig.rateLimit },
      revalidation: envConfig.revalidation || defaultConfig.revalidation,
      logging: { ...defaultConfig.logging, ...envConfig.logging },
    };
  }

  public getConfig(): WebhookConfig {
    return { ...this.config };
  }

  public getSecurityConfig(): WebhookSecurityConfig {
    return { ...this.config.security };
  }

  public getRateLimitConfig(): RateLimitConfig {
    return { ...this.config.rateLimit };
  }

  public getRevalidationStrategy(): RevalidationStrategy {
    return {
      immediate: [...this.config.revalidation.immediate],
      deferred: [...this.config.revalidation.deferred],
      cascade: [...this.config.revalidation.cascade],
    };
  }

  public updateConfig(updates: Partial<WebhookConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
  }

  public updateRevalidationStrategy(strategy: Partial<RevalidationStrategy>): void {
    this.config.revalidation = {
      immediate: strategy.immediate || this.config.revalidation.immediate,
      deferred: strategy.deferred || this.config.revalidation.deferred,
      cascade: strategy.cascade || this.config.revalidation.cascade,
    };
  }

  public validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate security config
    if (!this.config.security.secretToken) {
      errors.push('Security: secretToken is required');
    }

    if (this.config.security.rateLimitMaxRequests < 1) {
      errors.push('Security: rateLimitMaxRequests must be at least 1');
    }

    if (this.config.security.rateLimitWindowMs < 1000) {
      errors.push('Security: rateLimitWindowMs must be at least 1000ms');
    }

    // Validate rate limit config
    if (this.config.rateLimit.windowMs < 1000) {
      errors.push('RateLimit: windowMs must be at least 1000ms');
    }

    if (this.config.rateLimit.maxRequests < 1) {
      errors.push('RateLimit: maxRequests must be at least 1');
    }

    // Validate revalidation strategy
    if (!Array.isArray(this.config.revalidation.immediate)) {
      errors.push('Revalidation: immediate must be an array');
    }

    if (!Array.isArray(this.config.revalidation.deferred)) {
      errors.push('Revalidation: deferred must be an array');
    }

    if (!Array.isArray(this.config.revalidation.cascade)) {
      errors.push('Revalidation: cascade must be an array');
    }

    // Validate logging config
    if (this.config.logging.maxEntries < 1) {
      errors.push('Logging: maxEntries must be at least 1');
    }

    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(this.config.logging.level)) {
      errors.push('Logging: level must be one of: ' + validLogLevels.join(', '));
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  public importConfig(configJson: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(configJson);
      
      // Validate structure
      if (!imported || typeof imported !== 'object') {
        return { success: false, error: 'Invalid config format' };
      }

      // Merge with current config
      this.config = this.mergeConfigs(this.config, imported);

      // Validate merged config
      const validation = this.validateConfig();
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public getConfigSummary(): {
    security: {
      hasSecretToken: boolean;
      allowedIPsCount: number;
      rateLimitEnabled: boolean;
    };
    revalidation: {
      immediateRules: number;
      deferredRules: number;
      cascadeRules: number;
    };
    logging: {
      enabled: boolean;
      level: string;
      maxEntries: number;
    };
  } {
    return {
      security: {
        hasSecretToken: !!this.config.security.secretToken,
        allowedIPsCount: this.config.security.allowedIPs?.length || 0,
        rateLimitEnabled: this.config.security.rateLimitMaxRequests > 0,
      },
      revalidation: {
        immediateRules: this.config.revalidation.immediate.length,
        deferredRules: this.config.revalidation.deferred.length,
        cascadeRules: this.config.revalidation.cascade.length,
      },
      logging: {
        enabled: this.config.logging.enabled,
        level: this.config.logging.level,
        maxEntries: this.config.logging.maxEntries,
      },
    };
  }

  public static createCustomPathGenerator(
    pattern: string, 
    generator: (content: any) => string[]
  ): (content: any) => string[] {
    return (content: any) => {
      try {
        const paths = generator(content);
        return Array.isArray(paths) ? paths.filter(p => typeof p === 'string') : [];
      } catch (error) {
        console.error(`Path generator error for pattern '${pattern}':`, error);
        return [];
      }
    };
  }

  public static validatePathGenerator(
    generator: (content: any) => string[]
  ): { valid: boolean; error?: string } {
    try {
      const testContent = {
        id: 1,
        slug: 'test-content',
        type: 'post',
        action: 'update',
      };
      
      const result = generator(testContent);
      
      if (!Array.isArray(result)) {
        return { valid: false, error: 'Generator must return an array' };
      }
      
      for (const path of result) {
        if (typeof path !== 'string') {
          return { valid: false, error: 'All paths must be strings' };
        }
        if (!path.startsWith('/')) {
          return { valid: false, error: 'All paths must start with "/"' };
        }
      }
      
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Generator function error' 
      };
    }
  }
}