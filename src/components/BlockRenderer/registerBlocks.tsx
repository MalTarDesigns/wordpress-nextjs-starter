/**
 * Block Registration
 * 
 * This file registers all available block components with the BlockRegistry.
 * Import and call this function during app initialization.
 */

import React from 'react';
import { BlockRegistry } from './BlockRegistry';

// Core Gutenberg Block Components
import { CoreParagraph } from './blocks/core/CoreParagraph';
import { CoreHeading } from './blocks/core/CoreHeading';
import { CoreImage } from './blocks/core/CoreImage';
import { CoreList } from './blocks/core/CoreList';
import { CoreButton } from './blocks/core/CoreButton';
import { CoreColumns } from './blocks/core/CoreColumns';
import { CoreColumn } from './blocks/core/CoreColumn';

// ACF Block Components
import { ACFHeroBlock } from './blocks/acf/HeroBlock';
import { ACFHeroSection } from './blocks/acf/HeroSection';
import { ACFImageGallery } from './blocks/acf/ImageGallery';
import { ACFTestimonialBlock } from './blocks/acf/TestimonialBlock';
import { ACFTestimonialSection } from './blocks/acf/TestimonialSection';
import { ACFFAQSection } from './blocks/acf/FAQSection';
import { ACFCTABlock } from './blocks/acf/CTABlock';
import { ACFCTASection } from './blocks/acf/CTASection';

/**
 * Register all default block components
 */
export function registerDefaultBlocks(): void {
  try {
    // Register Core Gutenberg Blocks
    BlockRegistry.registerBlocks([
      {
        name: 'core/paragraph',
        component: CoreParagraph,
        category: 'common',
        icon: 'paragraph',
        description: 'Start with the building block of all narrative.',
        supports: {
          html: true,
          align: false,
          anchor: true,
          className: true,
          color: {
            background: true,
            text: true,
            gradients: true
          },
          typography: {
            fontSize: true,
            lineHeight: true
          },
          spacing: {
            padding: true,
            margin: true
          }
        }
      },
      {
        name: 'core/heading',
        component: CoreHeading,
        category: 'common',
        icon: 'heading',
        description: 'Introduce new sections and organize content to help visitors understand.',
        supports: {
          html: true,
          align: ['left', 'center', 'right'],
          anchor: true,
          className: true,
          color: {
            background: true,
            text: true,
            gradients: true
          },
          typography: {
            fontSize: true,
            lineHeight: true
          }
        }
      },
      {
        name: 'core/image',
        component: CoreImage,
        category: 'common',
        icon: 'format-image',
        description: 'Insert an image to make a visual statement.',
        supports: {
          html: false,
          align: ['left', 'center', 'right', 'wide', 'full'],
          anchor: true,
          className: true
        }
      },
      {
        name: 'core/list',
        component: CoreList,
        category: 'common',
        icon: 'editor-ul',
        description: 'Create a bulleted or numbered list.',
        supports: {
          html: true,
          align: false,
          anchor: true,
          className: true,
          color: {
            background: true,
            text: true
          },
          typography: {
            fontSize: true,
            lineHeight: true
          }
        }
      },
      {
        name: 'core/button',
        component: CoreButton,
        category: 'common',
        icon: 'button',
        description: 'Prompt visitors to take action with a button-style link.',
        supports: {
          html: false,
          align: false,
          anchor: true,
          className: true,
          color: {
            background: true,
            text: true,
            gradients: true
          },
          spacing: {
            padding: true,
            margin: true
          }
        }
      },
      {
        name: 'core/columns',
        component: CoreColumns,
        category: 'layout',
        icon: 'columns',
        description: 'Display content in multiple columns, with blocks added to each column.',
        supports: {
          html: false,
          align: ['wide', 'full'],
          anchor: true,
          className: true,
          color: {
            background: true,
            text: true,
            gradients: true
          }
        }
      },
      {
        name: 'core/column',
        component: CoreColumn,
        category: 'layout',
        icon: 'columns',
        description: 'A single column within a columns block.',
        supports: {
          html: false,
          align: false,
          anchor: false,
          className: true,
          color: {
            background: true,
            text: true,
            gradients: true
          },
          spacing: {
            padding: true
          }
        }
      }
    ]);

    // Register ACF Custom Blocks
    BlockRegistry.registerBlocks([
      {
        name: 'acf/hero',
        component: ACFHeroBlock,
        category: 'theme',
        icon: 'cover-image',
        description: 'Hero section with background image, title, subtitle, and call-to-action button.',
        supports: {
          html: false,
          align: ['full'],
          anchor: true,
          className: true
        }
      },
      {
        name: 'acf/hero-section',
        component: ACFHeroSection,
        category: 'theme',
        icon: 'cover-image',
        description: 'Advanced hero section with multiple layouts, parallax effects, and enhanced features.',
        supports: {
          html: false,
          align: ['full'],
          anchor: true,
          className: true
        }
      },
      {
        name: 'acf/image-gallery',
        component: ACFImageGallery,
        category: 'media',
        icon: 'format-gallery',
        description: 'Responsive image gallery with lightbox functionality and multiple layout options.',
        supports: {
          html: false,
          align: ['wide', 'full'],
          anchor: true,
          className: true
        }
      },
      {
        name: 'acf/testimonial',
        component: ACFTestimonialBlock,
        category: 'theme',
        icon: 'testimonial',
        description: 'Display customer testimonial with rating, quote, author information, and avatar.',
        supports: {
          html: false,
          align: false,
          anchor: true,
          className: true
        }
      },
      {
        name: 'acf/testimonial-section',
        component: ACFTestimonialSection,
        category: 'theme',
        icon: 'testimonial',
        description: 'Advanced testimonial section with multiple layouts, ratings, and carousel functionality.',
        supports: {
          html: false,
          align: ['wide', 'full'],
          anchor: true,
          className: true
        }
      },
      {
        name: 'acf/faq-section',
        component: ACFFAQSection,
        category: 'text',
        icon: 'editor-help',
        description: 'FAQ section with accordion functionality, search, and category filtering.',
        supports: {
          html: false,
          align: ['wide', 'full'],
          anchor: true,
          className: true
        }
      },
      {
        name: 'acf/cta',
        component: ACFCTABlock,
        category: 'theme',
        icon: 'megaphone',
        description: 'Call-to-action section with customizable background, text, and button.',
        supports: {
          html: false,
          align: ['wide', 'full'],
          anchor: true,
          className: true,
          color: {
            background: true,
            text: true
          }
        }
      },
      {
        name: 'acf/cta-section',
        component: ACFCTASection,
        category: 'theme',
        icon: 'megaphone',
        description: 'Advanced CTA section with multiple layouts, features list, and social proof.',
        supports: {
          html: false,
          align: ['wide', 'full'],
          anchor: true,
          className: true,
          color: {
            background: true,
            text: true
          }
        }
      }
    ]);

    console.log('✅ Default blocks registered successfully');
  } catch (error) {
    console.error('❌ Failed to register default blocks:', error);
  }
}

/**
 * Register additional core blocks that might be used less frequently
 */
export function registerExtendedCoreBlocks(): void {
  try {
    BlockRegistry.registerBlocks([
      // Add more core blocks as needed
      {
        name: 'core/quote',
        component: ({ attributes, innerHTML }) => (
          <blockquote 
            className="wp-block-quote"
            dangerouslySetInnerHTML={{ __html: innerHTML || attributes.value || '' }}
          />
        ),
        category: 'formatting',
        icon: 'format-quote',
        description: 'Give quoted text visual emphasis.',
        supports: {
          html: true,
          align: ['left', 'right'],
          anchor: true,
          className: true,
          color: {
            background: true,
            text: true
          }
        }
      },
      {
        name: 'core/code',
        component: ({ attributes, innerHTML }) => (
          <pre className="wp-block-code">
            <code dangerouslySetInnerHTML={{ __html: innerHTML || attributes.content || '' }} />
          </pre>
        ),
        category: 'formatting',
        icon: 'editor-code',
        description: 'Display code snippets that respect your spacing and tabs.',
        supports: {
          html: true,
          align: false,
          anchor: true,
          className: true,
          color: {
            background: true,
            text: true
          }
        }
      },
      {
        name: 'core/html',
        component: ({ attributes, innerHTML }) => (
          <div 
            className="wp-block-html"
            dangerouslySetInnerHTML={{ __html: innerHTML || attributes.content || '' }}
          />
        ),
        category: 'formatting',
        icon: 'html',
        description: 'Add custom HTML code.',
        supports: {
          html: true,
          align: false,
          anchor: false,
          className: false
        }
      }
    ]);

    console.log('✅ Extended core blocks registered successfully');
  } catch (error) {
    console.error('❌ Failed to register extended core blocks:', error);
  }
}

/**
 * Register common embed blocks
 */
export function registerEmbedBlocks(): void {
  const EmbedBlock = ({ attributes }: { attributes: any }) => {
    const { url, caption, type } = attributes;
    
    if (!url) return null;
    
    return (
      <figure className={`wp-block-embed wp-block-embed-${type || 'unknown'}`}>
        <div className="wp-block-embed__wrapper">
          {/* This would need proper embed handling based on the provider */}
          <iframe 
            src={url} 
            title={`Embedded content from ${type}`}
            className="embed-responsive-item"
            loading="lazy"
          />
        </div>
        {caption && (
          <figcaption 
            className="wp-element-caption"
            dangerouslySetInnerHTML={{ __html: caption }}
          />
        )}
      </figure>
    );
  };

  try {
    const embedTypes = [
      'youtube', 'twitter', 'instagram', 'vimeo', 'spotify', 
      'soundcloud', 'wordpress', 'facebook'
    ];

    embedTypes.forEach(embedType => {
      BlockRegistry.registerBlock({
        name: `core/embed`,
        component: EmbedBlock,
        category: 'embed',
        icon: 'embed-generic',
        description: `Embed ${embedType} content.`,
        supports: {
          html: false,
          align: false,
          anchor: true,
          className: true
        }
      });

      BlockRegistry.registerBlock({
        name: `core-embed/${embedType}`,
        component: EmbedBlock,
        category: 'embed',
        icon: `embed-${embedType}`,
        description: `Embed ${embedType} content.`,
        supports: {
          html: false,
          align: false,
          anchor: true,
          className: true
        }
      });
    });

    console.log('✅ Embed blocks registered successfully');
  } catch (error) {
    console.error('❌ Failed to register embed blocks:', error);
  }
}

/**
 * Initialize all default blocks
 */
export function initializeBlocks(): void {
  registerDefaultBlocks();
  registerExtendedCoreBlocks();
  registerEmbedBlocks();
  
  if (process.env.NODE_ENV === 'development') {
    const stats = BlockRegistry.getStats();
    console.log('📊 Block Registry Stats:', stats);
  }
}

// Auto-register blocks if not in test environment
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  initializeBlocks();
}