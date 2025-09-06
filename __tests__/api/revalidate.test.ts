/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { PUT, POST, GET } from '@/app/api/revalidate/route'

// Mock Next.js revalidation functions
const mockRevalidatePath = jest.fn()
const mockRevalidateTag = jest.fn()

jest.mock('next/cache', () => ({
  revalidatePath: (...args: any[]) => mockRevalidatePath(...args),
  revalidateTag: (...args: any[]) => mockRevalidateTag(...args)
}))

// Mock webhook security and logging classes
const mockValidateRequest = jest.fn()
const mockRecordSuccess = jest.fn()
const mockLogRequest = jest.fn()
const mockGetStatistics = jest.fn()
const mockGetStats = jest.fn()

jest.mock('@/lib/webhook/security', () => ({
  WebhookSecurity: jest.fn().mockImplementation(() => ({
    validateRequest: mockValidateRequest,
    recordSuccess: mockRecordSuccess,
    getStats: mockGetStats
  }))
}))

jest.mock('@/lib/webhook/logger', () => ({
  WebhookLogger: jest.fn().mockImplementation(() => ({
    logRequest: mockLogRequest,
    getStatistics: mockGetStatistics
  }))
}))

jest.mock('@/lib/webhook/revalidation', () => ({
  IntelligentRevalidator: jest.fn().mockImplementation(() => ({
    revalidateContent: jest.fn(),
    revalidateFromWordPress: jest.fn()
  }))
}))

// Helper to create mock NextRequest
function createMockRequest(
  method: 'GET' | 'POST' | 'PUT',
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const request = {
    method,
    nextUrl: { pathname: '/api/revalidate' },
    headers: new Map(Object.entries(headers || {})),
    text: async () => body ? JSON.stringify(body) : '',
    json: async () => body || {},
    ip: '127.0.0.1'
  } as unknown as NextRequest

  return request
}

describe('/api/revalidate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup environment
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL = 'https://example.com/wp'
    process.env.HEADLESS_SECRET = 'test-secret'
    
    // Default success responses
    mockValidateRequest.mockResolvedValue({ valid: true })
    mockRevalidatePath.mockResolvedValue(undefined)
    mockRevalidateTag.mockResolvedValue(undefined)
    mockLogRequest.mockResolvedValue(undefined)
    mockGetStatistics.mockReturnValue({
      totalRequests: 100,
      successfulRequests: 95,
      failedRequests: 5
    })
    mockGetStats.mockReturnValue({
      blockedRequests: 2,
      rateLimitViolations: 1
    })
  })

  describe('PUT /api/revalidate', () => {
    it('should revalidate paths successfully', async () => {
      const mockRevalidateContent = jest.fn().mockResolvedValue({
        pathsRevalidated: ['/page1', '/page2'],
        tagsRevalidated: [],
        errors: []
      })

      // Mock the IntelligentRevalidator
      const { IntelligentRevalidator } = require('@/lib/webhook/revalidation')
      IntelligentRevalidator.mockImplementation(() => ({
        revalidateContent: mockRevalidateContent
      }))

      const request = createMockRequest('PUT', {
        paths: ['/page1', '/page2']
      })

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toMatchObject({
        revalidated: true,
        paths: ['/page1', '/page2'],
        metadata: expect.objectContaining({
          revalidatedCount: 2
        })
      })
      expect(mockValidateRequest).toHaveBeenCalledWith(request)
      expect(mockRevalidateContent).toHaveBeenCalledWith({
        paths: ['/page1', '/page2']
      })
    })

    it('should revalidate tags successfully', async () => {
      const mockRevalidateContent = jest.fn().mockResolvedValue({
        pathsRevalidated: [],
        tagsRevalidated: ['posts', 'pages'],
        errors: []
      })

      const { IntelligentRevalidator } = require('@/lib/webhook/revalidation')
      IntelligentRevalidator.mockImplementation(() => ({
        revalidateContent: mockRevalidateContent
      }))

      const request = createMockRequest('PUT', {
        tags: ['posts', 'pages']
      })

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toMatchObject({
        revalidated: true,
        tags: ['posts', 'pages'],
        metadata: expect.objectContaining({
          revalidatedCount: 2
        })
      })
    })

    it('should handle validation errors', async () => {
      mockValidateRequest.mockResolvedValue({
        valid: false,
        error: { statusCode: 401, message: 'Unauthorized' }
      })

      const request = createMockRequest('PUT', {
        paths: ['/page1']
      })

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData).toMatchObject({
        revalidated: false,
        errors: ['Unauthorized'],
        metadata: expect.objectContaining({
          requestId: expect.any(String)
        })
      })
    })

    it('should handle invalid request data', async () => {
      const request = createMockRequest('PUT', {
        paths: 'invalid-paths' // Should be array
      })

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toMatchObject({
        revalidated: false,
        errors: ['paths must be an array']
      })
    })

    it('should handle invalid JSON', async () => {
      const request = {
        ...createMockRequest('PUT'),
        text: async () => '{ invalid json }'
      } as NextRequest

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toMatchObject({
        revalidated: false,
        errors: ['Invalid JSON format']
      })
    })

    it('should validate path format', async () => {
      const request = createMockRequest('PUT', {
        paths: ['invalid-path', '/valid-path'] // First path doesn't start with /
      })

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.errors).toContain('all paths must be strings starting with "/"')
    })

    it('should limit number of paths', async () => {
      const paths = Array.from({ length: 101 }, (_, i) => `/page-${i}`)
      
      const request = createMockRequest('PUT', { paths })

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.errors).toContain('maximum 100 paths allowed per request')
    })

    it('should handle revalidation errors gracefully', async () => {
      const mockRevalidateContent = jest.fn().mockResolvedValue({
        pathsRevalidated: ['/page1'],
        tagsRevalidated: [],
        errors: ['Failed to revalidate /page2']
      })

      const { IntelligentRevalidator } = require('@/lib/webhook/revalidation')
      IntelligentRevalidator.mockImplementation(() => ({
        revalidateContent: mockRevalidateContent
      }))

      const request = createMockRequest('PUT', {
        paths: ['/page1', '/page2']
      })

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(207) // Multi-status
      expect(responseData).toMatchObject({
        revalidated: true,
        errors: ['Failed to revalidate /page2']
      })
    })
  })

  describe('POST /api/revalidate (WordPress webhook)', () => {
    it('should handle WordPress post update', async () => {
      const mockRevalidateFromWordPress = jest.fn().mockResolvedValue({
        pathsRevalidated: ['/posts/test-post'],
        tagsRevalidated: ['posts'],
        errors: []
      })

      const { IntelligentRevalidator } = require('@/lib/webhook/revalidation')
      IntelligentRevalidator.mockImplementation(() => ({
        revalidateFromWordPress: mockRevalidateFromWordPress
      }))

      const wordpressPayload = {
        post_id: 123,
        post_title: 'Test Post',
        post_type: 'post',
        post_status: 'publish',
        action: 'update'
      }

      const request = createMockRequest('POST', wordpressPayload)

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toMatchObject({
        revalidated: true,
        paths: ['/posts/test-post'],
        tags: ['posts']
      })
      expect(mockRevalidateFromWordPress).toHaveBeenCalledWith(wordpressPayload)
    })

    it('should handle WordPress page deletion', async () => {
      const mockRevalidateFromWordPress = jest.fn().mockResolvedValue({
        pathsRevalidated: ['/about'],
        tagsRevalidated: ['pages'],
        errors: []
      })

      const { IntelligentRevalidator } = require('@/lib/webhook/revalidation')
      IntelligentRevalidator.mockImplementation(() => ({
        revalidateFromWordPress: mockRevalidateFromWordPress
      }))

      const wordpressPayload = {
        post_id: 456,
        post_title: 'About Page',
        post_type: 'page',
        post_status: 'trash',
        action: 'delete'
      }

      const request = createMockRequest('POST', wordpressPayload)

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.revalidated).toBe(true)
    })

    it('should handle security validation failure', async () => {
      mockValidateRequest.mockResolvedValue({
        valid: false,
        error: { statusCode: 403, message: 'Invalid secret' }
      })

      const request = createMockRequest('POST', {
        post_id: 123,
        action: 'update'
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(403)
      expect(responseData).toMatchObject({
        revalidated: false,
        errors: ['Invalid secret']
      })
    })
  })

  describe('GET /api/revalidate (health check)', () => {
    it('should return health status', async () => {
      const request = createMockRequest('GET')

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        version: expect.any(String),
        endpoints: expect.objectContaining({
          PUT: expect.any(String),
          POST: expect.any(String),
          GET: expect.any(String)
        })
      })
    })

    it('should return statistics with valid secret', async () => {
      const request = createMockRequest('GET', null, {
        'X-Headless-Secret-Key': 'test-secret'
      })
      request.nextUrl.searchParams = new URLSearchParams('stats=1') as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toMatchObject({
        status: 'ok',
        stats: expect.objectContaining({
          totalRequests: 100,
          successfulRequests: 95,
          failedRequests: 5,
          blockedRequests: 2,
          rateLimitViolations: 1
        })
      })
    })

    it('should reject statistics request with invalid secret', async () => {
      const request = createMockRequest('GET', null, {
        'X-Headless-Secret-Key': 'invalid-secret'
      })
      request.nextUrl.searchParams = new URLSearchParams('stats=1') as any

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData).toMatchObject({
        error: 'Unauthorized'
      })
    })
  })

  describe('error handling and logging', () => {
    it('should log all requests', async () => {
      const mockRevalidateContent = jest.fn().mockResolvedValue({
        pathsRevalidated: ['/test'],
        tagsRevalidated: [],
        errors: []
      })

      const { IntelligentRevalidator } = require('@/lib/webhook/revalidation')
      IntelligentRevalidator.mockImplementation(() => ({
        revalidateContent: mockRevalidateContent
      }))

      const request = createMockRequest('PUT', { paths: ['/test'] })

      await PUT(request)

      expect(mockLogRequest).toHaveBeenCalledWith(
        expect.any(String), // requestId
        expect.objectContaining({
          ip: '127.0.0.1',
          method: 'PUT',
          path: '/api/revalidate'
        }),
        expect.objectContaining({
          statusCode: 200
        }),
        expect.any(Object)
      )
    })

    it('should handle unexpected errors', async () => {
      const { IntelligentRevalidator } = require('@/lib/webhook/revalidation')
      IntelligentRevalidator.mockImplementation(() => ({
        revalidateContent: jest.fn().mockRejectedValue(new Error('Unexpected error'))
      }))

      const request = createMockRequest('PUT', { paths: ['/test'] })

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toMatchObject({
        revalidated: false,
        errors: ['Internal server error during revalidation']
      })
    })

    it('should include processing time in response headers', async () => {
      const mockRevalidateContent = jest.fn().mockResolvedValue({
        pathsRevalidated: ['/test'],
        tagsRevalidated: [],
        errors: []
      })

      const { IntelligentRevalidator } = require('@/lib/webhook/revalidation')
      IntelligentRevalidator.mockImplementation(() => ({
        revalidateContent: mockRevalidateContent
      }))

      const request = createMockRequest('PUT', { paths: ['/test'] })

      const response = await PUT(request)

      expect(response.headers.get('X-Processing-Time')).toBeTruthy()
      expect(response.headers.get('X-Request-Id')).toBeTruthy()
      expect(response.headers.get('X-Revalidated-Count')).toBe('1')
    })
  })
})