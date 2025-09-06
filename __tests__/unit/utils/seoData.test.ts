/**
 * @jest-environment node
 */

import {
  setSeoData,
  generateArticleStructuredData,
  generateWebsiteStructuredData,
  generateBreadcrumbStructuredData,
  generateStructuredData,
  setSeoDataLegacy
} from '@/utils/seoData'
import type { MetadataGenerationOptions, SEOData } from '@/types/wordpress'

describe('seoData utilities', () => {
  const baseUrl = 'https://example.com'
  const siteName = 'Test Site'
  
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = baseUrl
    process.env.NEXT_PUBLIC_SITE_NAME = siteName
    process.env.NEXT_PUBLIC_LOCALE = 'en_US'
    process.env.NEXT_PUBLIC_TWITTER_HANDLE = '@testsite'
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID = '123456789'
  })

  describe('setSeoData', () => {
    it('should return minimal metadata when no SEO data provided', () => {
      const options: MetadataGenerationOptions = {}
      const result = setSeoData(options)

      expect(result).toEqual({
        metadataBase: new URL(baseUrl),
        title: siteName,
        description: 'WordPress site powered by Next.js'
      })
    })

    it('should throw error when base URL is not set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL
      
      expect(() => setSeoData({})).toThrow(
        'NEXT_PUBLIC_BASE_URL environment variable is required'
      )
    })

    it('should generate complete metadata from SEO data', () => {
      const seoData: SEOData = {
        title: 'Test Page Title',
        metaDesc: 'Test page description',
        metaKeywords: 'test, keywords, seo',
        canonical: 'https://example.com/test-page',
        opengraphTitle: 'OG Test Title',
        opengraphDescription: 'OG test description',
        opengraphUrl: 'https://example.com/test-page',
        opengraphSiteName: siteName,
        opengraphType: 'article',
        opengraphImage: {
          sourceUrl: 'https://example.com/og-image.jpg',
          altText: 'Test OG Image',
          mediaDetails: { width: 1200, height: 630 }
        },
        twitterTitle: 'Twitter Test Title',
        twitterDescription: 'Twitter test description',
        twitterImage: {
          sourceUrl: 'https://example.com/twitter-image.jpg',
          altText: 'Test Twitter Image'
        },
        metaRobotsNoindex: 'index',
        metaRobotsNofollow: 'follow'
      }

      const options: MetadataGenerationOptions = { seo: seoData }
      const result = setSeoData(options)

      expect(result.title).toBe('Test Page Title')
      expect(result.description).toBe('Test page description')
      expect(result.keywords).toBe('test, keywords, seo')
      expect(result.robots).toEqual({
        index: true,
        follow: true,
        noarchive: false,
        nosnippet: false,
        noimageindex: false
      })
      expect(result.alternates?.canonical).toBe('https://example.com/test-page')
      expect(result.openGraph).toMatchObject({
        title: 'OG Test Title',
        description: 'OG test description',
        url: 'https://example.com/test-page',
        siteName: siteName,
        type: 'article',
        locale: 'en_US',
        images: [{
          url: 'https://example.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Test OG Image'
        }]
      })
      expect(result.twitter).toMatchObject({
        card: 'summary_large_image',
        title: 'Twitter Test Title',
        description: 'Twitter test description',
        images: ['https://example.com/twitter-image.jpg'],
        site: '@testsite'
      })
      expect(result.facebook).toEqual({
        appId: '123456789'
      })
    })

    it('should handle content data for article metadata', () => {
      const contentData = {
        title: 'Article Title',
        excerpt: 'Article excerpt',
        publishedTime: '2023-01-01T00:00:00Z',
        modifiedTime: '2023-01-02T00:00:00Z',
        author: {
          name: 'John Doe',
          url: 'https://example.com/author/john-doe'
        },
        images: [{
          sourceUrl: 'https://example.com/featured-image.jpg',
          altText: 'Featured Image',
          mediaDetails: { width: 800, height: 600 }
        }]
      }

      const options: MetadataGenerationOptions = { 
        content: contentData,
        type: 'article'
      }
      const result = setSeoData(options)

      expect(result.title).toBe('Article Title')
      expect(result.description).toBe('Article excerpt')
      expect(result.openGraph?.publishedTime).toBe('2023-01-01T00:00:00Z')
      expect(result.openGraph?.modifiedTime).toBe('2023-01-02T00:00:00Z')
      expect(result.openGraph?.authors).toEqual(['John Doe'])
      expect(result.twitter?.creator).toBe('John Doe')
      expect(result.wordPress?.postType).toBe('post')
      expect(result.wordPress?.author).toBe('John Doe')
    })

    it('should handle robots meta tags correctly', () => {
      const seoData: SEOData = {
        title: 'Test',
        metaRobotsNoindex: 'noindex',
        metaRobotsNofollow: 'nofollow'
      }

      const result = setSeoData({ seo: seoData })

      expect(result.robots).toEqual({
        index: false,
        follow: false,
        noarchive: false,
        nosnippet: false,
        noimageindex: false
      })
    })

    it('should use fallback images when no specific images provided', () => {
      const result = setSeoData({ seo: { title: 'Test' } })

      expect(result.openGraph?.images).toEqual([{
        url: `${baseUrl}/images/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Default social media image'
      }])
    })
  })

  describe('generateArticleStructuredData', () => {
    it('should return null when no content provided', () => {
      const result = generateArticleStructuredData({})
      expect(result).toBeNull()
    })

    it('should generate article structured data', () => {
      const options: MetadataGenerationOptions = {
        content: {
          title: 'Test Article',
          excerpt: 'Test article excerpt',
          publishedTime: '2023-01-01T00:00:00Z',
          modifiedTime: '2023-01-02T00:00:00Z',
          author: {
            name: 'John Doe',
            url: 'https://example.com/author/john-doe'
          }
        },
        seo: {
          metaDesc: 'SEO description',
          metaKeywords: 'test, article, structured data',
          opengraphImage: {
            sourceUrl: 'https://example.com/article-image.jpg',
            altText: 'Article Image'
          }
        },
        canonical: 'https://example.com/test-article'
      }

      const result = generateArticleStructuredData(options)

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
        description: 'SEO description',
        image: 'https://example.com/article-image.jpg',
        datePublished: '2023-01-01T00:00:00Z',
        dateModified: '2023-01-02T00:00:00Z',
        author: {
          '@type': 'Person',
          name: 'John Doe',
          url: 'https://example.com/author/john-doe'
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/images/logo.png`
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': 'https://example.com/test-article'
        },
        keywords: ['test', 'article', 'structured data']
      })
    })
  })

  describe('generateWebsiteStructuredData', () => {
    it('should generate website structured data', () => {
      const result = generateWebsiteStructuredData()

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: baseUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      })
    })
  })

  describe('generateBreadcrumbStructuredData', () => {
    it('should return null for empty breadcrumbs', () => {
      const result = generateBreadcrumbStructuredData([])
      expect(result).toBeNull()
    })

    it('should generate breadcrumb structured data', () => {
      const breadcrumbs = [
        { text: 'Home', url: '/' },
        { text: 'Blog', url: '/blog' },
        { text: 'Test Post' }
      ]

      const result = generateBreadcrumbStructuredData(breadcrumbs)

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${baseUrl}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${baseUrl}/blog`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Test Post',
            item: baseUrl
          }
        ]
      })
    })
  })

  describe('generateStructuredData', () => {
    it('should combine all structured data types', () => {
      const options: MetadataGenerationOptions = {
        content: {
          title: 'Test Article',
          excerpt: 'Test excerpt',
          publishedTime: '2023-01-01T00:00:00Z',
          author: { name: 'John Doe' }
        }
      }
      const breadcrumbs = [{ text: 'Home', url: '/' }]

      const result = generateStructuredData(options, breadcrumbs)

      expect(result).toHaveProperty('website')
      expect(result).toHaveProperty('article')
      expect(result).toHaveProperty('breadcrumbs')
      expect(result.website['@type']).toBe('WebSite')
      expect(result.article['@type']).toBe('Article')
      expect(result.breadcrumbs['@type']).toBe('BreadcrumbList')
    })

    it('should only include website data when no article content', () => {
      const result = generateStructuredData({})

      expect(result).toHaveProperty('website')
      expect(result).not.toHaveProperty('article')
      expect(result).not.toHaveProperty('breadcrumbs')
    })
  })

  describe('setSeoDataLegacy', () => {
    it('should work with legacy API', () => {
      const seoData: SEOData = {
        title: 'Legacy Title',
        metaDesc: 'Legacy description'
      }

      const result = setSeoDataLegacy({ seo: seoData })

      expect(result.title).toBe('Legacy Title')
      expect(result.description).toBe('Legacy description')
    })
  })
})