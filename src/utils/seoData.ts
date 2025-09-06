import type { Metadata } from 'next';
import type { 
  SEOData, 
  WordPressMetadata, 
  MetadataGenerationOptions,
  ArticleStructuredData,
  WebsiteStructuredData,
  BreadcrumbStructuredData
} from '@/types/wordpress';
import type { hasValidSEO, hasOpenGraphImage, hasTwitterImage } from '@/types/metadata';

// Default SEO configuration
const DEFAULT_SEO_CONFIG = {
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'WordPress Site',
  locale: process.env.NEXT_PUBLIC_LOCALE || 'en_US',
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  defaultImage: {
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/og-default.jpg`,
    width: 1200,
    height: 630,
    alt: 'Default social media image'
  }
};

// Enhanced SEO data generator with strict typing
export const setSeoData = (options: MetadataGenerationOptions): WordPressMetadata => {
  const { seo, content, canonical, noIndex, noFollow, siteName, locale, type = 'website' } = options;
  
  // Validate base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL environment variable is required');
  }

  // If no SEO data and no content, return minimal metadata
  if (!hasValidSEO(seo) && !content) {
    return {
      metadataBase: new URL(baseUrl),
      title: DEFAULT_SEO_CONFIG.siteName,
      description: 'WordPress site powered by Next.js',
    };
  }

  // Build title
  const title = seo?.title || content?.title || '';
  const description = seo?.metaDesc || content?.excerpt || '';

  // Build robots configuration
  const robots = {
    index: noIndex ? false : (seo?.metaRobotsNoindex !== 'noindex'),
    follow: noFollow ? false : (seo?.metaRobotsNofollow !== 'nofollow'),
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
  };

  // Build OpenGraph images
  const ogImages = [];
  if (hasOpenGraphImage(seo)) {
    ogImages.push({
      url: seo!.opengraphImage!.sourceUrl,
      width: seo!.opengraphImage!.mediaDetails?.width || 1200,
      height: seo!.opengraphImage!.mediaDetails?.height || 630,
      alt: seo!.opengraphImage!.altText || title,
    });
  } else if (content?.images?.[0]) {
    ogImages.push({
      url: content.images[0].sourceUrl,
      width: content.images[0].mediaDetails?.width || 1200,
      height: content.images[0].mediaDetails?.height || 630,
      alt: content.images[0].altText || title,
    });
  } else {
    ogImages.push(DEFAULT_SEO_CONFIG.defaultImage);
  }

  // Build Twitter images
  const twitterImages = [];
  if (hasTwitterImage(seo)) {
    twitterImages.push(seo!.twitterImage!.sourceUrl);
  } else if (ogImages[0]) {
    twitterImages.push(ogImages[0].url);
  }

  const metadata: WordPressMetadata = {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords: seo?.metaKeywords,
    robots,
    alternates: {
      canonical: canonical || seo?.canonical,
    },
    openGraph: {
      title: seo?.opengraphTitle || title,
      description: seo?.opengraphDescription || description,
      url: seo?.opengraphUrl || canonical || '',
      siteName: siteName || seo?.opengraphSiteName || DEFAULT_SEO_CONFIG.siteName,
      images: ogImages,
      locale: locale || DEFAULT_SEO_CONFIG.locale,
      type: seo?.opengraphType || type,
      ...(content?.publishedTime && { publishedTime: content.publishedTime }),
      ...(content?.modifiedTime && { modifiedTime: content.modifiedTime }),
      ...(content?.author && { authors: [content.author.name] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.twitterTitle || title,
      description: seo?.twitterDescription || description,
      images: twitterImages,
      ...(DEFAULT_SEO_CONFIG.twitterHandle && { site: DEFAULT_SEO_CONFIG.twitterHandle }),
      ...(content?.author && { creator: content.author.name }),
    },
    ...(DEFAULT_SEO_CONFIG.facebookAppId && {
      facebook: {
        appId: DEFAULT_SEO_CONFIG.facebookAppId,
      },
    }),
    // WordPress-specific metadata
    wordPress: {
      ...(content && {
        postType: type === 'article' ? 'post' : 'page',
        author: content.author?.name,
        publishedTime: content.publishedTime,
        modifiedTime: content.modifiedTime,
      }),
    },
  };

  return metadata;
};

// Generate structured data for articles
export const generateArticleStructuredData = (
  options: MetadataGenerationOptions
): ArticleStructuredData | null => {
  const { seo, content, canonical } = options;
  
  if (!content || !content.title) {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const siteName = DEFAULT_SEO_CONFIG.siteName;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: seo?.metaDesc || content.excerpt,
    image: seo?.opengraphImage?.sourceUrl,
    datePublished: content.publishedTime || new Date().toISOString(),
    dateModified: content.modifiedTime || content.publishedTime || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: content.author?.name || 'Anonymous',
      ...(content.author?.url && { url: content.author.url }),
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical || baseUrl,
    },
    ...(seo?.metaKeywords && { keywords: seo.metaKeywords.split(',').map(k => k.trim()) }),
  };
};

// Generate website structured data
export const generateWebsiteStructuredData = (): WebsiteStructuredData => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const siteName = DEFAULT_SEO_CONFIG.siteName;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (
  breadcrumbs: Array<{ text: string; url?: string }>
): BreadcrumbStructuredData | null => {
  if (!breadcrumbs.length) {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.text,
      item: item.url ? `${baseUrl}${item.url}` : baseUrl,
    })),
  };
};

// Utility to combine all structured data
export const generateStructuredData = (
  options: MetadataGenerationOptions,
  breadcrumbs?: Array<{ text: string; url?: string }>
): Record<string, unknown> => {
  const structuredData: Record<string, unknown> = {};

  // Website data (always include)
  structuredData.website = generateWebsiteStructuredData();

  // Article data (for posts/articles)
  const articleData = generateArticleStructuredData(options);
  if (articleData) {
    structuredData.article = articleData;
  }

  // Breadcrumb data
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbs);
    if (breadcrumbData) {
      structuredData.breadcrumbs = breadcrumbData;
    }
  }

  return structuredData;
};

// Legacy function for backward compatibility
export const setSeoDataLegacy = ({ seo }: { seo?: SEOData }): Metadata => {
  return setSeoData({ seo }) as Metadata;
};
