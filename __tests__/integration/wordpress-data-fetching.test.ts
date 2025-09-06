/**
 * @jest-environment node
 */

import { fetchGraphQL, fetchGraphQLWithRevalidation, fetchGraphQLFresh } from '@/utils/fetchGraphQL'
import { setSeoData } from '@/utils/seoData'
import { parseBlocks } from '@/utils/blockParser'

// Mock server for integration tests
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock WordPress GraphQL responses
const mockWordPressData = {
  posts: {
    nodes: [
      {
        id: 'cG9zdDox',
        title: 'Test Post',
        slug: 'test-post',
        date: '2023-01-01T00:00:00',
        modified: '2023-01-02T00:00:00',
        excerpt: 'This is a test post excerpt',
        content: `
          <!-- wp:paragraph -->
          <p>This is the first paragraph of the test post.</p>
          <!-- /wp:paragraph -->
          
          <!-- wp:heading {"level":2} -->
          <h2>Test Heading</h2>
          <!-- /wp:heading -->
          
          <!-- wp:image {"id":123} -->
          <figure class="wp-block-image">
            <img src="https://example.com/test-image.jpg" alt="Test Image" />
          </figure>
          <!-- /wp:image -->
        `,
        author: {
          node: {
            name: 'Test Author',
            slug: 'test-author'
          }
        },
        featuredImage: {
          node: {
            sourceUrl: 'https://example.com/featured-image.jpg',
            altText: 'Featured Image',
            mediaDetails: {
              width: 1200,
              height: 630
            }
          }
        },
        seo: {
          title: 'SEO Test Post Title',
          metaDesc: 'This is the SEO description for the test post',
          opengraphTitle: 'OG Test Post Title',
          opengraphDescription: 'This is the OG description',
          opengraphImage: {
            sourceUrl: 'https://example.com/og-image.jpg',
            altText: 'OG Image',
            mediaDetails: {
              width: 1200,
              height: 630
            }
          }
        }
      }
    ]
  },
  pages: {
    nodes: [
      {
        id: 'cGFnZTox',
        title: 'Test Page',
        slug: 'test-page',
        date: '2023-01-01T00:00:00',
        content: `
          <!-- wp:acf/hero-section {"title":"Hero Title","subtitle":"Hero Subtitle"} -->
          <div class="hero-section">
            <h1>Hero Title</h1>
            <p>Hero Subtitle</p>
          </div>
          <!-- /wp:acf/hero-section -->
          
          <!-- wp:columns -->
          <div class="wp-block-columns">
            <!-- wp:column -->
            <div class="wp-block-column">
              <!-- wp:paragraph -->
              <p>Column 1 content</p>
              <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
            
            <!-- wp:column -->
            <div class="wp-block-column">
              <!-- wp:paragraph -->
              <p>Column 2 content</p>
              <!-- /wp:paragraph -->
            </div>
            <!-- /wp:column -->
          </div>
          <!-- /wp:columns -->
        `,
        seo: {
          title: 'SEO Test Page Title',
          metaDesc: 'This is the SEO description for the test page'
        }
      }
    ]
  }
}

// Setup MSW server for mocking WordPress API
const server = setupServer(
  // Mock successful GraphQL response
  http.post('https://test-wp.com/wp/graphql', async ({ request }) => {
    const body = await request.json() as any
    const query = body.query as string
    
    // Mock different queries
    if (query.includes('posts')) {
      return HttpResponse.json({
        data: { posts: mockWordPressData.posts }
      })
    }
    
    if (query.includes('pages')) {
      return HttpResponse.json({
        data: { pages: mockWordPressData.pages }
      })
    }
    
    if (query.includes('generalSettings')) {
      return HttpResponse.json({
        data: {
          generalSettings: {
            title: 'Test WordPress Site',
            description: 'A test WordPress site',
            url: 'https://test-wp.com'
          }
        }
      })
    }
    
    // Default empty response
    return HttpResponse.json({
      data: {}
    })
  }),
  
  // Mock GraphQL error response
  http.post('https://error-wp.com/wp/graphql', () => {
    return HttpResponse.json({
      data: null,
      errors: [
        {
          message: 'Field "invalidField" doesn\'t exist on type "RootQuery"',
          locations: [{ line: 2, column: 3 }],
          path: ['invalidField']
        }
      ]
    })
  }),
  
  // Mock network error
  http.post('https://network-error.com/wp/graphql', () => {
    return new HttpResponse(null, { status: 500 })
  })
)

describe('WordPress Data Fetching Integration', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
  })
  
  afterEach(() => {
    server.resetHandlers()
  })
  
  afterAll(() => {
    server.close()
  })

  beforeEach(() => {
    // Setup test environment
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL = 'https://test-wp.com/wp'
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com'
    process.env.NEXT_PUBLIC_SITE_NAME = 'Test Site'
    
    // Mock Next.js functions
    jest.clearAllMocks()
  })

  describe('fetchGraphQL integration', () => {
    it('should fetch and parse WordPress posts successfully', async () => {
      const postsQuery = `
        query GetPosts {
          posts(first: 10) {
            nodes {
              id
              title
              slug
              date
              excerpt
              content
              author {
                node {
                  name
                  slug
                }
              }
              featuredImage {
                node {
                  sourceUrl
                  altText
                  mediaDetails {
                    width
                    height
                  }
                }
              }
              seo {
                title
                metaDesc
                opengraphTitle
                opengraphDescription
                opengraphImage {
                  sourceUrl
                  altText
                  mediaDetails {
                    width
                    height
                  }
                }
              }
            }
          }
        }
      `

      const result = await fetchGraphQL(postsQuery)

      expect(result).toHaveProperty('posts')
      expect(result.posts.nodes).toHaveLength(1)
      
      const post = result.posts.nodes[0]
      expect(post).toMatchObject({
        id: 'cG9zdDox',
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'This is a test post excerpt'
      })
      
      expect(post.author.node.name).toBe('Test Author')
      expect(post.featuredImage.node.sourceUrl).toBe('https://example.com/featured-image.jpg')
      expect(post.seo.title).toBe('SEO Test Post Title')
    })

    it('should handle GraphQL errors properly', async () => {
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL = 'https://error-wp.com/wp'

      const invalidQuery = `
        query InvalidQuery {
          invalidField
        }
      `

      await expect(fetchGraphQL(invalidQuery)).rejects.toThrow(
        'Field "invalidField" doesn\'t exist on type "RootQuery"'
      )
    })

    it('should handle network errors', async () => {
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL = 'https://network-error.com/wp'

      const query = 'query { posts { nodes { id } } }'

      await expect(fetchGraphQL(query)).rejects.toThrow('HTTP 500')
    })
  })

  describe('Content processing integration', () => {
    it('should parse WordPress content into blocks and generate metadata', async () => {
      // Fetch post data
      const postsQuery = `
        query GetPosts {
          posts(first: 1) {
            nodes {
              id
              title
              content
              seo {
                title
                metaDesc
                opengraphImage {
                  sourceUrl
                  altText
                  mediaDetails {
                    width
                    height
                  }
                }
              }
            }
          }
        }
      `

      const result = await fetchGraphQL(postsQuery)
      const post = result.posts.nodes[0]

      // Parse blocks from content
      const parsedBlocks = parseBlocks(post.content)

      expect(parsedBlocks.blocks).toHaveLength(3)
      expect(parsedBlocks.blocks[0].name).toBe('paragraph')
      expect(parsedBlocks.blocks[1].name).toBe('heading')
      expect(parsedBlocks.blocks[2].name).toBe('image')
      expect(parsedBlocks.errors).toHaveLength(0)

      // Generate SEO metadata
      const metadata = setSeoData({
        seo: post.seo,
        content: {
          title: post.title,
          publishedTime: '2023-01-01T00:00:00Z',
          modifiedTime: '2023-01-02T00:00:00Z'
        },
        type: 'article'
      })

      expect(metadata.title).toBe('SEO Test Post Title')
      expect(metadata.description).toBe('This is the SEO description for the test post')
      expect(metadata.openGraph?.type).toBe('article')
      expect(metadata.openGraph?.images?.[0]).toMatchObject({
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'OG Image'
      })
    })

    it('should handle complex nested blocks', async () => {
      const pagesQuery = `
        query GetPages {
          pages(first: 1) {
            nodes {
              id
              title
              content
            }
          }
        }
      `

      const result = await fetchGraphQL(pagesQuery)
      const page = result.pages.nodes[0]

      const parsedBlocks = parseBlocks(page.content)

      expect(parsedBlocks.blocks).toHaveLength(2)
      
      // First block should be ACF hero section
      expect(parsedBlocks.blocks[0].name).toBe('acf/hero-section')
      expect(parsedBlocks.blocks[0].attrs).toMatchObject({
        title: 'Hero Title',
        subtitle: 'Hero Subtitle'
      })

      // Second block should be columns with nested content
      expect(parsedBlocks.blocks[1].name).toBe('columns')
      expect(parsedBlocks.blocks[1].innerBlocks).toHaveLength(2)
      expect(parsedBlocks.blocks[1].innerBlocks![0].name).toBe('column')
      expect(parsedBlocks.blocks[1].innerBlocks![0].innerBlocks).toHaveLength(1)
      expect(parsedBlocks.blocks[1].innerBlocks![0].innerBlocks![0].name).toBe('paragraph')
    })
  })

  describe('Caching strategies integration', () => {
    it('should use different caching strategies correctly', async () => {
      const query = `
        query GetSettings {
          generalSettings {
            title
            description
            url
          }
        }
      `

      // Test revalidation caching
      const revalidationResult = await fetchGraphQLWithRevalidation(query, {}, 3600)
      expect(revalidationResult.generalSettings.title).toBe('Test WordPress Site')

      // Test fresh data fetching
      const freshResult = await fetchGraphQLFresh(query)
      expect(freshResult.generalSettings.title).toBe('Test WordPress Site')

      // Both should return the same data but with different caching strategies
      expect(revalidationResult).toEqual(freshResult)
    })
  })

  describe('Error recovery integration', () => {
    it('should handle partial failures gracefully', async () => {
      // Setup server to return partial data with some errors
      server.use(
        http.post('https://test-wp.com/wp/graphql', () => {
          return HttpResponse.json({
            data: {
              posts: {
                nodes: [
                  {
                    id: 'cG9zdDox',
                    title: 'Test Post',
                    content: null // Simulate missing content
                  }
                ]
              }
            },
            errors: [
              {
                message: 'Content field could not be retrieved',
                path: ['posts', 'nodes', 0, 'content']
              }
            ]
          })
        })
      )

      const query = `
        query GetPosts {
          posts {
            nodes {
              id
              title
              content
            }
          }
        }
      `

      // Should throw because there are GraphQL errors
      await expect(fetchGraphQL(query)).rejects.toThrow('Content field could not be retrieved')
    })

    it('should handle malformed content gracefully', async () => {
      const malformedContent = `
        <!-- wp:paragraph -->
        <p>Valid paragraph</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:invalid-block { invalid json } -->
        <div>Invalid block</div>
        <!-- /wp:invalid-block -->
        
        <!-- wp:paragraph -->
        <p>Another valid paragraph</p>
        <!-- /wp:paragraph -->
      `

      const parsedBlocks = parseBlocks(malformedContent, {
        stripInvalidBlocks: true,
        validateAttributes: true
      })

      // Should parse valid blocks and warn about invalid ones
      expect(parsedBlocks.blocks).toHaveLength(2) // Only valid blocks
      expect(parsedBlocks.warnings.length).toBeGreaterThan(0)
      expect(parsedBlocks.blocks[0].name).toBe('paragraph')
      expect(parsedBlocks.blocks[1].name).toBe('paragraph')
    })
  })

  describe('Performance integration', () => {
    it('should handle large content efficiently', async () => {
      // Generate large content with many blocks
      const largeContent = Array.from({ length: 100 }, (_, i) => `
        <!-- wp:paragraph -->
        <p>Paragraph ${i + 1} with some content that makes it realistic.</p>
        <!-- /wp:paragraph -->
      `).join('\n')

      const startTime = performance.now()
      const parsedBlocks = parseBlocks(largeContent)
      const endTime = performance.now()

      expect(parsedBlocks.blocks).toHaveLength(100)
      expect(parsedBlocks.errors).toHaveLength(0)
      
      // Should parse in reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000)
      
      // Should have correct block type statistics
      expect(parsedBlocks.metadata.blockTypes.paragraph).toBe(100)
      expect(parsedBlocks.metadata.totalBlocks).toBe(100)
    })
  })
})