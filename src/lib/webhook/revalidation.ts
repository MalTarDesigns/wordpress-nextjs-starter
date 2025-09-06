import { revalidatePath, revalidateTag } from 'next/cache';
import type { 
  RevalidationRequest, 
  PathMappingRule, 
  RevalidationStrategy,
  WordPressUpdatePayload 
} from '@/types/wordpress';

export interface RevalidationResult {
  pathsRevalidated: string[];
  tagsRevalidated: string[];
  errors: string[];
  processingTimeMs: number;
}

export class IntelligentRevalidator {
  private strategy: RevalidationStrategy;

  constructor(strategy?: RevalidationStrategy) {
    this.strategy = strategy || this.getDefaultStrategy();
  }

  async revalidateContent(request: RevalidationRequest): Promise<RevalidationResult> {
    const startTime = Date.now();
    const result: RevalidationResult = {
      pathsRevalidated: [],
      tagsRevalidated: [],
      errors: [],
      processingTimeMs: 0,
    };

    try {
      // Direct path and tag revalidation
      await this.revalidateDirectly(request, result);

      // Intelligent content-based revalidation
      if (request.contentType && request.contentId) {
        await this.revalidateByContent(request, result);
      }

      // Cascade revalidation based on content relationships
      if (request.action && ['create', 'update', 'delete'].includes(request.action)) {
        await this.revalidateCascade(request, result);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Revalidation failed: ${errorMessage}`);
    }

    result.processingTimeMs = Date.now() - startTime;
    return result;
  }

  async revalidateFromWordPress(payload: WordPressUpdatePayload): Promise<RevalidationResult> {
    // Convert WordPress payload to revalidation request
    const request: RevalidationRequest = {
      contentType: this.normalizeContentType(payload.post_type),
      contentId: payload.post_id,
      action: this.normalizeAction(payload.action),
      metadata: {
        postTitle: payload.post_title,
        postSlug: payload.post_slug,
        postStatus: payload.post_status,
        postParent: payload.post_parent,
        userId: payload.user_id,
        blogId: payload.blog_id,
        timestamp: payload.timestamp,
      },
    };

    return this.revalidateContent(request);
  }

  private async revalidateDirectly(
    request: RevalidationRequest, 
    result: RevalidationResult
  ): Promise<void> {
    // Revalidate explicit paths
    if (request.paths && request.paths.length > 0) {
      for (const path of request.paths) {
        try {
          await revalidatePath(path);
          result.pathsRevalidated.push(path);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`Failed to revalidate path ${path}: ${errorMessage}`);
        }
      }
    }

    // Revalidate explicit tags
    if (request.tags && request.tags.length > 0) {
      for (const tag of request.tags) {
        try {
          await revalidateTag(tag);
          result.tagsRevalidated.push(tag);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`Failed to revalidate tag ${tag}: ${errorMessage}`);
        }
      }
    }
  }

  private async revalidateByContent(
    request: RevalidationRequest,
    result: RevalidationResult
  ): Promise<void> {
    const { contentType, contentId, metadata, action } = request;
    
    // Get relevant mapping rules
    const rules = this.strategy.immediate.filter(rule => 
      rule.contentType === contentType || rule.contentType === 'all'
    );

    for (const rule of rules) {
      try {
        const contentData = {
          id: contentId,
          type: contentType,
          action,
          ...metadata,
        };

        const paths = rule.pathGenerator(contentData);
        
        for (const path of paths) {
          try {
            await revalidatePath(path);
            result.pathsRevalidated.push(path);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(`Failed to revalidate generated path ${path}: ${errorMessage}`);
          }
        }

        // Revalidate associated tags
        if (rule.tags) {
          for (const tag of rule.tags) {
            try {
              await revalidateTag(tag);
              result.tagsRevalidated.push(tag);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              result.errors.push(`Failed to revalidate rule tag ${tag}: ${errorMessage}`);
            }
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push(`Failed to apply mapping rule for ${contentType}: ${errorMessage}`);
      }
    }
  }

  private async revalidateCascade(
    request: RevalidationRequest,
    result: RevalidationResult
  ): Promise<void> {
    const { contentType, action, metadata } = request;

    // Get cascade rules
    const cascadeRules = this.strategy.cascade.filter(rule =>
      rule.contentType === contentType || rule.contentType === 'all'
    );

    for (const rule of cascadeRules) {
      try {
        const contentData = {
          type: contentType,
          action,
          ...metadata,
        };

        const paths = rule.pathGenerator(contentData);
        
        for (const path of paths) {
          try {
            await revalidatePath(path);
            result.pathsRevalidated.push(path);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(`Failed to revalidate cascade path ${path}: ${errorMessage}`);
          }
        }

        // Revalidate cascade tags
        if (rule.tags) {
          for (const tag of rule.tags) {
            try {
              await revalidateTag(tag);
              result.tagsRevalidated.push(tag);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              result.errors.push(`Failed to revalidate cascade tag ${tag}: ${errorMessage}`);
            }
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push(`Failed to apply cascade rule for ${contentType}: ${errorMessage}`);
      }
    }
  }

  private normalizeContentType(postType?: string): 'post' | 'page' | 'custom' | 'all' {
    if (!postType) return 'custom';
    
    switch (postType.toLowerCase()) {
      case 'post':
        return 'post';
      case 'page':
        return 'page';
      default:
        return 'custom';
    }
  }

  private normalizeAction(action: string): 'create' | 'update' | 'delete' | 'publish' | 'unpublish' {
    const actionMap: Record<string, 'create' | 'update' | 'delete' | 'publish' | 'unpublish'> = {
      'wp_insert_post': 'create',
      'save_post': 'update',
      'post_updated': 'update',
      'delete_post': 'delete',
      'transition_post_status': 'publish',
      'publish_post': 'publish',
      'draft_post': 'unpublish',
      'private_post': 'unpublish',
    };

    return actionMap[action] || 'update';
  }

  private getDefaultStrategy(): RevalidationStrategy {
    return {
      immediate: [
        {
          contentType: 'post',
          pattern: '/posts/:slug',
          pathGenerator: (content) => {
            const paths = [`/posts/${content.slug || content.id}`];
            if (content.slug) {
              paths.push(`/blog/${content.slug}`);
            }
            return paths;
          },
          tags: ['posts', 'blog'],
        },
        {
          contentType: 'page',
          pattern: '/:slug',
          pathGenerator: (content) => {
            const paths = [`/${content.slug || ''}`];
            if (content.slug && content.slug !== 'home') {
              paths.push(`/${content.slug}`);
            }
            return paths;
          },
          tags: ['pages'],
        },
        {
          contentType: 'all',
          pattern: '/sitemap',
          pathGenerator: () => ['/sitemap.xml', '/robots.txt'],
          tags: ['sitemap'],
        },
      ],
      deferred: [
        {
          contentType: 'post',
          pattern: '/category/:category',
          pathGenerator: (content) => {
            const categories = content.categories || [];
            return categories.map((cat: string) => `/category/${cat}`);
          },
          tags: ['categories'],
        },
        {
          contentType: 'post',
          pattern: '/tag/:tag',
          pathGenerator: (content) => {
            const tags = content.tags || [];
            return tags.map((tag: string) => `/tag/${tag}`);
          },
          tags: ['post-tags'],
        },
      ],
      cascade: [
        {
          contentType: 'all',
          pattern: '/feeds',
          pathGenerator: () => ['/feed', '/rss.xml', '/atom.xml'],
          tags: ['feeds'],
        },
        {
          contentType: 'all',
          pattern: '/archives',
          pathGenerator: (content) => {
            if (content.action === 'delete') {
              return ['/archive', '/posts'];
            }
            return [];
          },
          tags: ['archives'],
        },
        {
          contentType: 'page',
          pattern: '/navigation',
          pathGenerator: (content) => {
            // Revalidate navigation-related pages when pages change
            return ['/', '/about', '/contact'];
          },
          tags: ['navigation'],
        },
      ],
    };
  }

  updateStrategy(newStrategy: Partial<RevalidationStrategy>): void {
    this.strategy = {
      immediate: newStrategy.immediate || this.strategy.immediate,
      deferred: newStrategy.deferred || this.strategy.deferred,
      cascade: newStrategy.cascade || this.strategy.cascade,
    };
  }

  getStrategy(): RevalidationStrategy {
    return { ...this.strategy };
  }
}