/**
 * @jest-environment node
 */

import { 
  fetchGraphQL, 
  fetchGraphQLWithRevalidation, 
  fetchGraphQLFresh,
  GraphQLError,
  NetworkError
} from '@/utils/fetchGraphQL'

// Mock Next.js functions
const mockDraftMode = jest.fn()
const mockCookies = jest.fn()

jest.mock('next/headers', () => ({
  draftMode: () => mockDraftMode(),
  cookies: () => mockCookies()
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('fetchGraphQL', () => {
  const mockQuery = 'query GetPosts { posts { nodes { id title } } }'
  const mockVariables = { first: 10 }
  const mockResponseData = {
    posts: {
      nodes: [
        { id: '1', title: 'Test Post 1' },
        { id: '2', title: 'Test Post 2' }
      ]
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDraftMode.mockReturnValue({ isEnabled: false })
    mockCookies.mockReturnValue({
      get: jest.fn().mockReturnValue(undefined)
    })
    
    // Setup default environment
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL = 'https://example.com/wp'
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('successful requests', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockResponseData })
      })
    })

    it('should fetch GraphQL data successfully', async () => {
      const result = await fetchGraphQL(mockQuery)
      
      expect(result).toEqual(mockResponseData)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/wp/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': 'Next.js WordPress Client'
          }),
          body: JSON.stringify({
            query: mockQuery,
            variables: { preview: false }
          })
        })
      )
    })

    it('should include variables in the request', async () => {
      await fetchGraphQL(mockQuery, { variables: mockVariables })
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/wp/graphql',
        expect.objectContaining({
          body: JSON.stringify({
            query: mockQuery,
            variables: { preview: false, ...mockVariables }
          })
        })
      )
    })

    it('should handle preview mode with authentication', async () => {
      mockDraftMode.mockReturnValue({ isEnabled: true })
      mockCookies.mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'test-jwt-token' })
      })

      await fetchGraphQL(mockQuery)
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/wp/graphql',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-jwt-token'
          }),
          body: JSON.stringify({
            query: mockQuery,
            variables: { preview: true }
          }),
          cache: 'no-cache'
        })
      )
    })

    it('should include custom headers', async () => {
      const customHeaders = { 'X-Custom-Header': 'test-value' }
      
      await fetchGraphQL(mockQuery, { headers: customHeaders })
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/wp/graphql',
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders)
        })
      )
    })

    it('should handle cache and revalidate options', async () => {
      await fetchGraphQL(mockQuery, { 
        cache: 'force-cache', 
        revalidate: 3600,
        tags: ['posts', 'wordpress']
      })
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/wp/graphql',
        expect.objectContaining({
          cache: 'force-cache',
          next: {
            revalidate: 3600,
            tags: ['posts', 'wordpress']
          }
        })
      )
    })
  })

  describe('error handling', () => {
    it('should throw error when API URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_WORDPRESS_API_URL
      
      await expect(fetchGraphQL(mockQuery)).rejects.toThrow(
        'NEXT_PUBLIC_WORDPRESS_API_URL environment variable is not set'
      )
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        url: 'https://example.com/wp/graphql'
      })

      await expect(fetchGraphQL(mockQuery)).rejects.toThrow(NetworkError)
      await expect(fetchGraphQL(mockQuery)).rejects.toThrow('HTTP 404: Not Found')
    })

    it('should handle GraphQL errors', async () => {
      const graphqlErrors = [
        { message: 'Field "invalidField" doesn\'t exist' },
        { message: 'Access denied' }
      ]
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: null,
          errors: graphqlErrors
        })
      })

      await expect(fetchGraphQL(mockQuery)).rejects.toThrow(GraphQLError)
      await expect(fetchGraphQL(mockQuery)).rejects.toThrow(
        'Field "invalidField" doesn\'t exist, Access denied'
      )
    })

    it('should handle timeout', async () => {
      jest.useFakeTimers()
      
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 15000))
      )

      const fetchPromise = fetchGraphQL(mockQuery, { timeout: 5000 })
      
      jest.advanceTimersByTime(5000)
      
      await expect(fetchPromise).rejects.toThrow('GraphQL request timeout after 5000ms')
      
      jest.useRealTimers()
    })

    it('should handle missing data in response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: null })
      })

      await expect(fetchGraphQL(mockQuery)).rejects.toThrow(
        'GraphQL response contains no data'
      )
    })

    it('should handle JSON parse errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('Invalid JSON') }
      })

      await expect(fetchGraphQL(mockQuery)).rejects.toThrow()
    })
  })

  describe('convenience functions', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockResponseData })
      })
    })

    it('should use fetchGraphQLWithRevalidation correctly', async () => {
      await fetchGraphQLWithRevalidation(mockQuery, mockVariables, 1800)
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/wp/graphql',
        expect.objectContaining({
          cache: 'force-cache',
          next: expect.objectContaining({
            revalidate: 1800
          })
        })
      )
    })

    it('should use fetchGraphQLFresh correctly', async () => {
      await fetchGraphQLFresh(mockQuery, mockVariables)
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/wp/graphql',
        expect.objectContaining({
          cache: 'no-store'
        })
      )
    })
  })

  describe('error classes', () => {
    it('should create GraphQLError with correct properties', () => {
      const errors = [{ message: 'Test error' }]
      const query = 'test query'
      const variables = { test: true }
      
      const error = new GraphQLError('Test message', errors, query, variables)
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(GraphQLError)
      expect(error.name).toBe('GraphQLError')
      expect(error.message).toBe('Test message')
      expect(error.errors).toBe(errors)
      expect(error.query).toBe(query)
      expect(error.variables).toBe(variables)
    })

    it('should create NetworkError with correct properties', () => {
      const error = new NetworkError('Network failed', 500, 'Internal Server Error')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(NetworkError)
      expect(error.name).toBe('NetworkError')
      expect(error.message).toBe('Network failed')
      expect(error.status).toBe(500)
      expect(error.statusText).toBe('Internal Server Error')
    })
  })
})