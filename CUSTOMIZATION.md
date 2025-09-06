# Customization Guide

This guide covers how to customize and extend the WordPress Next.js starter template for your specific needs. Whether you're building a simple blog or a complex business website, this template provides the foundation for extensive customization.

## Table of Contents

1. [Theming and Styling](#theming-and-styling)
2. [Custom WordPress Blocks](#custom-wordpress-blocks)
3. [Adding New Content Types](#adding-new-content-types)
4. [Custom API Endpoints](#custom-api-endpoints)
5. [SEO Customization](#seo-customization)
6. [Component Customization](#component-customization)
7. [WordPress Integration](#wordpress-integration)
8. [Performance Optimization](#performance-optimization)
9. [Advanced Configurations](#advanced-configurations)

## Theming and Styling

### Color System Customization

The template uses CSS variables for consistent theming. Customize colors in `src/app/globals.css`:

```css
:root {
  /* Brand Colors */
  --primary: 210 100% 50%;        /* Blue */
  --primary-foreground: 0 0% 100%; /* White text on primary */
  
  /* Custom Brand Variables */
  --brand-red: 0 84% 60%;
  --brand-green: 142 71% 45%;
  --brand-purple: 262 83% 58%;
  
  /* Background and Text */
  --background: 0 0% 100%;         /* White background */
  --foreground: 0 0% 3.9%;         /* Near-black text */
  --muted: 210 40% 98%;            /* Light gray */
  --muted-foreground: 215.4 16.3% 46.9%; /* Medium gray */
}

.dark {
  --background: 0 0% 3.9%;         /* Dark background */
  --foreground: 0 0% 98%;          /* Light text */
  --primary: 210 100% 50%;         /* Same primary, works in dark */
  /* ... other dark mode overrides */
}
```

### Tailwind Configuration

Extend the default theme in `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom brand colors
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        // Override default colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
      fontFamily: {
        // Custom fonts
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Open Sans', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // Custom spacing
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        // Custom animations
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### Typography System

Customize typography with Tailwind's typography plugin:

```css
/* src/app/globals.css */
.prose {
  /* Custom prose styles for WordPress content */
  --tw-prose-body: hsl(var(--foreground));
  --tw-prose-headings: hsl(var(--foreground));
  --tw-prose-lead: hsl(var(--muted-foreground));
  --tw-prose-links: hsl(var(--primary));
  --tw-prose-bold: hsl(var(--foreground));
  --tw-prose-counters: hsl(var(--muted-foreground));
  --tw-prose-bullets: hsl(var(--muted-foreground));
  --tw-prose-hr: hsl(var(--border));
  --tw-prose-quotes: hsl(var(--foreground));
  --tw-prose-quote-borders: hsl(var(--border));
  --tw-prose-captions: hsl(var(--muted-foreground));
  --tw-prose-code: hsl(var(--foreground));
  --tw-prose-pre-code: hsl(var(--muted-foreground));
  --tw-prose-pre-bg: hsl(var(--muted));
  --tw-prose-th-borders: hsl(var(--border));
  --tw-prose-td-borders: hsl(var(--border));
}

/* Dark mode overrides */
.dark .prose {
  --tw-prose-invert-body: hsl(var(--foreground));
  --tw-prose-invert-headings: hsl(var(--foreground));
  /* ... other dark mode prose variables */
}
```

## Custom WordPress Blocks

### Creating a Custom Block Component

1. Create the React component:

```tsx
// src/components/BlockRenderer/blocks/custom/HeroSection.tsx
import { BlockComponentProps } from '@/types/blocks';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface HeroSectionAttributes {
  title: string;
  subtitle: string;
  backgroundImage: {
    url: string;
    alt: string;
  };
  ctaText: string;
  ctaUrl: string;
  overlay?: boolean;
}

export function HeroSection({ attributes }: BlockComponentProps<HeroSectionAttributes>) {
  const { title, subtitle, backgroundImage, ctaText, ctaUrl, overlay = true } = attributes;

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage.url}
          alt={backgroundImage.alt}
          fill
          className="object-cover"
          priority
        />
        {overlay && <div className="absolute inset-0 bg-black/50" />}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-up">
          {title}
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-200 animate-fade-up animation-delay-200">
          {subtitle}
        </p>
        <Button
          asChild
          size="lg"
          className="animate-fade-up animation-delay-400"
        >
          <a href={ctaUrl}>{ctaText}</a>
        </Button>
      </div>
    </section>
  );
}
```

2. Register the block:

```tsx
// src/components/BlockRenderer/registerBlocks.ts
import { BlockRegistry } from './BlockRegistry';
import { HeroSection } from './blocks/custom/HeroSection';

BlockRegistry.registerBlock({
  name: 'acf/hero-section',
  component: HeroSection,
  category: 'custom',
  icon: 'cover-image',
  title: 'Hero Section',
  description: 'A customizable hero section with background image and call-to-action',
  supports: {
    align: ['wide', 'full'],
    anchor: true,
    customClassName: true,
  },
});
```

3. Create WordPress ACF Fields:

```php
// In your WordPress theme's functions.php or plugin
if( function_exists('acf_add_local_field_group') ):
    acf_add_local_field_group(array(
        'key' => 'group_hero_section',
        'title' => 'Hero Section',
        'fields' => array(
            array(
                'key' => 'field_hero_title',
                'label' => 'Title',
                'name' => 'title',
                'type' => 'text',
                'required' => 1,
            ),
            array(
                'key' => 'field_hero_subtitle',
                'label' => 'Subtitle',
                'name' => 'subtitle',
                'type' => 'textarea',
            ),
            array(
                'key' => 'field_hero_background',
                'label' => 'Background Image',
                'name' => 'background_image',
                'type' => 'image',
                'required' => 1,
            ),
            array(
                'key' => 'field_hero_cta_text',
                'label' => 'CTA Text',
                'name' => 'cta_text',
                'type' => 'text',
                'default_value' => 'Learn More',
            ),
            array(
                'key' => 'field_hero_cta_url',
                'label' => 'CTA URL',
                'name' => 'cta_url',
                'type' => 'url',
            ),
            array(
                'key' => 'field_hero_overlay',
                'label' => 'Show Overlay',
                'name' => 'overlay',
                'type' => 'true_false',
                'default_value' => 1,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'block',
                    'operator' => '==',
                    'value' => 'acf/hero-section',
                ),
            ),
        ),
    ));
endif;
```

### Complex Block with Multiple Layouts

```tsx
// src/components/BlockRenderer/blocks/custom/ContentGrid.tsx
import { BlockComponentProps } from '@/types/blocks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface ContentGridAttributes {
  layout: 'cards' | 'list' | 'masonry';
  columns: number;
  items: Array<{
    title: string;
    description: string;
    image?: {
      url: string;
      alt: string;
    };
    link?: string;
  }>;
}

export function ContentGrid({ attributes }: BlockComponentProps<ContentGridAttributes>) {
  const { layout, columns, items } = attributes;

  const getGridClasses = () => {
    const baseClasses = 'grid gap-6';
    switch (layout) {
      case 'cards':
        return `${baseClasses} grid-cols-1 md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns}`;
      case 'list':
        return `${baseClasses} grid-cols-1`;
      case 'masonry':
        return `${baseClasses} columns-1 md:columns-${Math.min(columns, 3)} lg:columns-${columns}`;
      default:
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
    }
  };

  const renderItem = (item: typeof items[0], index: number) => {
    const content = (
      <>
        {item.image && (
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <Image
              src={item.image.url}
              alt={item.image.alt}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="line-clamp-2">{item.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="line-clamp-3">{item.description}</CardDescription>
        </CardContent>
      </>
    );

    return (
      <Card key={index} className="group hover:shadow-lg transition-shadow">
        {item.link ? (
          <a href={item.link} className="block h-full">
            {content}
          </a>
        ) : (
          content
        )}
      </Card>
    );
  };

  return (
    <div className="content-grid">
      <div className={getGridClasses()}>
        {items.map(renderItem)}
      </div>
    </div>
  );
}
```

## Adding New Content Types

### 1. Register Custom Post Type in WordPress

```php
// In your theme's functions.php
function register_custom_post_types() {
    // Portfolio items
    register_post_type('portfolio', array(
        'labels' => array(
            'name' => 'Portfolio',
            'singular_name' => 'Portfolio Item',
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'portfolio'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'show_in_graphql' => true,
        'graphql_single_name' => 'portfolioItem',
        'graphql_plural_name' => 'portfolioItems',
    ));

    // Team members
    register_post_type('team', array(
        'labels' => array(
            'name' => 'Team',
            'singular_name' => 'Team Member',
        ),
        'public' => true,
        'rewrite' => array('slug' => 'team'),
        'supports' => array('title', 'editor', 'thumbnail'),
        'show_in_graphql' => true,
        'graphql_single_name' => 'teamMember',
        'graphql_plural_name' => 'teamMembers',
    ));
}
add_action('init', 'register_custom_post_types');
```

### 2. Add Custom Fields

```php
// ACF fields for portfolio
if( function_exists('acf_add_local_field_group') ):
    acf_add_local_field_group(array(
        'key' => 'group_portfolio',
        'title' => 'Portfolio Details',
        'fields' => array(
            array(
                'key' => 'field_portfolio_client',
                'label' => 'Client',
                'name' => 'client',
                'type' => 'text',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_portfolio_year',
                'label' => 'Year',
                'name' => 'year',
                'type' => 'number',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_portfolio_technologies',
                'label' => 'Technologies',
                'name' => 'technologies',
                'type' => 'select',
                'multiple' => 1,
                'choices' => array(
                    'react' => 'React',
                    'nextjs' => 'Next.js',
                    'wordpress' => 'WordPress',
                    'typescript' => 'TypeScript',
                ),
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_portfolio_gallery',
                'label' => 'Gallery',
                'name' => 'gallery',
                'type' => 'gallery',
                'show_in_graphql' => 1,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'portfolio',
                ),
            ),
        ),
    ));
endif;
```

### 3. Create TypeScript Types

```typescript
// src/types/portfolio.ts
export interface PortfolioItem {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
  portfolioFields: {
    client: string;
    year: number;
    technologies: string[];
    gallery: Array<{
      sourceUrl: string;
      altText: string;
    }>;
  };
}

export interface PortfolioConnection {
  nodes: PortfolioItem[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
}
```

### 4. Create GraphQL Queries

```typescript
// src/queries/portfolio.ts
import { gql } from 'graphql-tag';

export const GET_PORTFOLIO_ITEMS = gql`
  query GetPortfolioItems($first: Int, $after: String) {
    portfolioItems(first: $first, after: $after) {
      nodes {
        id
        title
        content
        excerpt
        slug
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        portfolioFields {
          client
          year
          technologies
          gallery {
            sourceUrl
            altText
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_PORTFOLIO_ITEM = gql`
  query GetPortfolioItem($slug: String!) {
    portfolioItemBy(slug: $slug) {
      id
      title
      content
      excerpt
      slug
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      portfolioFields {
        client
        year
        technologies
        gallery {
          sourceUrl
          altText
        }
      }
    }
  }
`;
```

### 5. Create Template Components

```tsx
// src/components/Templates/Portfolio/PortfolioTemplate.tsx
import { PortfolioItem } from '@/types/portfolio';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import BlockRenderer from '@/components/BlockRenderer';

interface PortfolioTemplateProps {
  portfolio: PortfolioItem;
}

export function PortfolioTemplate({ portfolio }: PortfolioTemplateProps) {
  const { title, content, portfolioFields, featuredImage } = portfolio;

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Client:</span>
            <span className="ml-2">{portfolioFields.client}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Year:</span>
            <span className="ml-2">{portfolioFields.year}</span>
          </div>
        </div>

        {portfolioFields.technologies && (
          <div className="flex flex-wrap gap-2 mb-6">
            {portfolioFields.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {featuredImage && (
          <div className="aspect-video relative rounded-lg overflow-hidden">
            <Image
              src={featuredImage.node.sourceUrl}
              alt={featuredImage.node.altText}
              fill
              className="object-cover"
            />
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none">
        <BlockRenderer content={content} />
      </div>

      {portfolioFields.gallery && portfolioFields.gallery.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioFields.gallery.map((image, index) => (
              <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                <Image
                  src={image.sourceUrl}
                  alt={image.altText}
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
```

### 6. Create Custom Hooks

```tsx
// src/hooks/usePortfolio.ts
import { useState, useEffect } from 'react';
import { fetchGraphQL } from '@/utils/fetchGraphQL';
import { GET_PORTFOLIO_ITEMS, GET_PORTFOLIO_ITEM } from '@/queries/portfolio';
import { PortfolioItem, PortfolioConnection } from '@/types/portfolio';

export function usePortfolioItems(first: number = 12) {
  const [data, setData] = useState<PortfolioConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await fetchGraphQL(GET_PORTFOLIO_ITEMS, { first });
        setData(result.portfolioItems);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [first]);

  return { data, loading, error };
}

export function usePortfolioItem(slug: string) {
  const [data, setData] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await fetchGraphQL(GET_PORTFOLIO_ITEM, { slug });
        setData(result.portfolioItemBy);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug]);

  return { data, loading, error };
}
```

## Custom API Endpoints

### Create a Newsletter Signup Endpoint

```typescript
// src/app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { headers } from 'next/headers';

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  preferences: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') ?? 'unknown';
    
    // Validate request body
    const body = await request.json();
    const validatedData = newsletterSchema.parse(body);

    // Integration with email service (example with Mailchimp)
    const response = await fetch(`https://us1.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: validatedData.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: validatedData.name,
        },
        interests: validatedData.preferences?.reduce((acc, pref) => {
          acc[pref] = true;
          return acc;
        }, {} as Record<string, boolean>),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to newsletter');
    }

    // Log subscription (optional)
    console.log(`Newsletter subscription: ${validatedData.email} from ${ip}`);

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Create a Contact Form Handler

```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().optional(), // Spam prevention
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

    // Check honeypot field (should be empty)
    if (validatedData.honeypot && validatedData.honeypot.trim() !== '') {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.CONTACT_EMAIL,
      subject: `Contact Form: ${validatedData.subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${validatedData.name}</p>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Subject:</strong> ${validatedData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${validatedData.message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: validatedData.email,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
```

## SEO Customization

### Custom SEO Component

```tsx
// src/components/SEO/CustomSEO.tsx
import { Metadata } from 'next';
import { setSeoData } from '@/utils/seoData';

interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  schema?: Record<string, any>;
}

export function generateCustomMetadata(seoData: SEOData): Metadata {
  const baseMetadata = setSeoData(seoData);

  return {
    ...baseMetadata,
    other: {
      // Custom meta tags
      'article:author': seoData.author,
      'article:published_time': seoData.publishedTime,
      'article:modified_time': seoData.modifiedTime,
      'article:tag': seoData.tags?.join(','),
      
      // Pinterest verification
      'p:domain_verify': process.env.NEXT_PUBLIC_PINTEREST_VERIFICATION,
      
      // Custom business info
      'business:contact_data:street_address': '123 Main St',
      'business:contact_data:locality': 'City',
      'business:contact_data:region': 'State',
      'business:contact_data:postal_code': '12345',
      'business:contact_data:country_name': 'Country',
    },
  };
}

// JSON-LD Schema generation
export function generateSchemaMarkup(type: string, data: any) {
  const schemas: Record<string, any> = {
    article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title,
      description: data.description,
      image: data.image,
      datePublished: data.publishedTime,
      dateModified: data.modifiedTime,
      author: {
        '@type': 'Person',
        name: data.author,
      },
      publisher: {
        '@type': 'Organization',
        name: process.env.NEXT_PUBLIC_SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
        },
      },
    },
    product: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.title,
      description: data.description,
      image: data.image,
      offers: {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: data.currency || 'USD',
        availability: 'https://schema.org/InStock',
      },
    },
    service: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: data.title,
      description: data.description,
      provider: {
        '@type': 'Organization',
        name: process.env.NEXT_PUBLIC_SITE_NAME,
      },
      areaServed: data.serviceArea || 'Worldwide',
    },
  };

  return schemas[type] || schemas.article;
}
```

### Enhanced Sitemap Generation

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { fetchGraphQL } from '@/utils/fetchGraphQL';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';

  // Fetch all content from WordPress
  const [pages, posts, portfolioItems] = await Promise.all([
    fetchGraphQL(`
      query GetAllPages {
        pages {
          nodes {
            slug
            modified
          }
        }
      }
    `),
    fetchGraphQL(`
      query GetAllPosts {
        posts {
          nodes {
            slug
            modified
          }
        }
      }
    `),
    fetchGraphQL(`
      query GetAllPortfolio {
        portfolioItems {
          nodes {
            slug
            modified
          }
        }
      }
    `),
  ]);

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic routes from WordPress
  const dynamicRoutes: MetadataRoute.Sitemap = [
    // Pages
    ...pages.pages.nodes.map((page: any) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.modified),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    // Posts
    ...posts.posts.nodes.map((post: any) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // Portfolio items
    ...portfolioItems.portfolioItems.nodes.map((item: any) => ({
      url: `${baseUrl}/portfolio/${item.slug}`,
      lastModified: new Date(item.modified),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
```

## Component Customization

### Custom Navigation Component

```tsx
// src/components/Globals/Navigation/CustomNavigation.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Moon, Sun } from 'lucide-react';

interface NavigationItem {
  label: string;
  url: string;
  children?: NavigationItem[];
}

interface CustomNavigationProps {
  menuItems: NavigationItem[];
  logo?: {
    url: string;
    alt: string;
  };
}

export function CustomNavigation({ menuItems, logo }: CustomNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/80 backdrop-blur-md border-b shadow-sm' 
        : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {logo ? (
            <img src={logo.url} alt={logo.alt} className="h-8 w-auto" />
          ) : (
            <span className="text-xl font-bold">Your Site</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => (
            <div key={item.url} className="relative group">
              <Link
                href={item.url}
                className="text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
              
              {/* Dropdown menu */}
              {item.children && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {item.children.map((child) => (
                    <Link
                      key={child.url}
                      href={child.url}
                      className="block px-4 py-2 text-sm hover:bg-muted"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Theme Toggle & Mobile Menu */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-6">
                {menuItems.map((item) => (
                  <div key={item.url}>
                    <Link
                      href={item.url}
                      onClick={() => setIsMobileOpen(false)}
                      className="block py-2 text-lg"
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="pl-4 space-y-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.url}
                            href={child.url}
                            onClick={() => setIsMobileOpen(false)}
                            className="block py-1 text-muted-foreground"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
```

## WordPress Integration

### Custom WordPress Functions

```php
// Add to your WordPress theme's functions.php

// Customize GraphQL schema
add_filter('graphql_schema_config', function($config) {
    // Add custom resolvers
    $config['resolvers'] = array_merge($config['resolvers'], [
        'RootQuery' => [
            'customSiteInfo' => function() {
                return [
                    'businessHours' => get_option('business_hours', '9 AM - 5 PM'),
                    'contactInfo' => [
                        'phone' => get_option('business_phone'),
                        'email' => get_option('business_email'),
                        'address' => get_option('business_address'),
                    ],
                    'socialMedia' => [
                        'facebook' => get_option('facebook_url'),
                        'twitter' => get_option('twitter_url'),
                        'instagram' => get_option('instagram_url'),
                    ],
                ];
            },
        ],
    ]);
    return $config;
});

// Register custom GraphQL types
add_action('graphql_register_types', function() {
    register_graphql_object_type('ContactInfo', [
        'fields' => [
            'phone' => ['type' => 'String'],
            'email' => ['type' => 'String'],
            'address' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('SocialMedia', [
        'fields' => [
            'facebook' => ['type' => 'String'],
            'twitter' => ['type' => 'String'],
            'instagram' => ['type' => 'String'],
        ],
    ]);

    register_graphql_object_type('CustomSiteInfo', [
        'fields' => [
            'businessHours' => ['type' => 'String'],
            'contactInfo' => ['type' => 'ContactInfo'],
            'socialMedia' => ['type' => 'SocialMedia'],
        ],
    ]);

    register_graphql_field('RootQuery', 'customSiteInfo', [
        'type' => 'CustomSiteInfo',
        'resolve' => function() {
            return [
                'businessHours' => get_option('business_hours', '9 AM - 5 PM'),
                'contactInfo' => [
                    'phone' => get_option('business_phone'),
                    'email' => get_option('business_email'),
                    'address' => get_option('business_address'),
                ],
                'socialMedia' => [
                    'facebook' => get_option('facebook_url'),
                    'twitter' => get_option('twitter_url'),
                    'instagram' => get_option('instagram_url'),
                ],
            ];
        },
    ]);
});

// Add custom admin options
add_action('admin_menu', function() {
    add_options_page(
        'Site Configuration',
        'Site Configuration',
        'manage_options',
        'site-config',
        'site_config_page'
    );
});

function site_config_page() {
    if (isset($_POST['submit'])) {
        update_option('business_hours', sanitize_text_field($_POST['business_hours']));
        update_option('business_phone', sanitize_text_field($_POST['business_phone']));
        update_option('business_email', sanitize_email($_POST['business_email']));
        update_option('business_address', sanitize_textarea_field($_POST['business_address']));
        update_option('facebook_url', esc_url_raw($_POST['facebook_url']));
        update_option('twitter_url', esc_url_raw($_POST['twitter_url']));
        update_option('instagram_url', esc_url_raw($_POST['instagram_url']));
        
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }

    $business_hours = get_option('business_hours', '');
    $business_phone = get_option('business_phone', '');
    // ... other options
    ?>
    
    <div class="wrap">
        <h1>Site Configuration</h1>
        <form method="post" action="">
            <table class="form-table">
                <tr>
                    <th scope="row">Business Hours</th>
                    <td><input type="text" name="business_hours" value="<?php echo esc_attr($business_hours); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row">Business Phone</th>
                    <td><input type="text" name="business_phone" value="<?php echo esc_attr($business_phone); ?>" /></td>
                </tr>
                <!-- Add more fields -->
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
```

## Performance Optimization

### Image Optimization Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-wordpress-site.com',
      'secure.gravatar.com',
      // Add other image domains
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Enable experimental features
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './analyze/client.html',
          })
        );
      }
      return config;
    },
  }),
};

module.exports = nextConfig;
```

### Custom Caching Strategy

```typescript
// src/utils/cache.ts
interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  revalidate?: boolean; // Enable ISR revalidation
}

class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: any; expires: number; tags: string[] }>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, options: CacheOptions = {}): void {
    const { ttl = 3600, tags = [] } = options;
    const expires = Date.now() + (ttl * 1000);
    
    this.cache.set(key, { data, expires, tags });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  invalidateByTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheManager = CacheManager.getInstance();

// Cached GraphQL fetch
export async function cachedFetchGraphQL(
  query: string, 
  variables?: any,
  options: CacheOptions = {}
) {
  const cacheKey = `gql:${btoa(query)}:${JSON.stringify(variables)}`;
  
  // Try cache first
  const cached = cacheManager.get(cacheKey);
  if (cached) return cached;
  
  // Fetch and cache
  const data = await fetchGraphQL(query, variables);
  cacheManager.set(cacheKey, data, options);
  
  return data;
}
```

This comprehensive customization guide provides the foundation for extending the WordPress Next.js starter template to meet specific project requirements. Each section builds upon the template's existing architecture while providing practical, real-world examples.