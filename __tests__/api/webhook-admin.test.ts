/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/webhook/admin/route'

// Mock webhook components
const mockGetConfig = jest.fn()
const mockGetConfigSummary = jest.fn()
const mockValidateConfig = jest.fn()
const mockUpdateConfig = jest.fn()
const mockImportConfig = jest.fn()
const mockExportConfig = jest.fn()

jest.mock('@/lib/webhook/config', () => ({
  WebhookConfigManager: {
    getInstance: jest.fn().mockImplementation(() => ({
      getConfig: mockGetConfig,
      getConfigSummary: mockGetConfigSummary,
      validateConfig: mockValidateConfig,
      updateConfig: mockUpdateConfig,
      importConfig: mockImportConfig,
      exportConfig: mockExportConfig
    }))
  }
}))

const mockGetStatistics = jest.fn()
const mockGetStats = jest.fn()
const mockGetRecentLogs = jest.fn()
const mockClear = jest.fn()

jest.mock('@/lib/webhook/security', () => ({
  WebhookSecurity: jest.fn().mockImplementation(() => ({
    getStats: mockGetStats
  }))
}))

jest.mock('@/lib/webhook/logger', () => ({
  WebhookLogger: jest.fn().mockImplementation(() => ({
    getStatistics: mockGetStatistics,
    getRecentLogs: mockGetRecentLogs,
    clear: mockClear
  }))
}))

jest.mock('@/lib/webhook/revalidation', () => ({
  IntelligentRevalidator: jest.fn().mockImplementation(() => ({}))
}))

// Helper to create mock NextRequest
function createMockRequest(
  method: 'GET' | 'POST',
  searchParams?: Record<string, string>,
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const url = new URL('http://localhost/api/webhook/admin')
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const request = {
    method,
    url: url.toString(),
    nextUrl: url,
    headers: new Map(Object.entries(headers || {})),
    text: async () => body ? JSON.stringify(body) : '',
    json: async () => body || {}
  } as unknown as NextRequest

  return request
}

describe('/api/webhook/admin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup environment
    process.env.HEADLESS_SECRET = 'admin-secret'
    
    // Default mock responses
    mockGetConfig.mockReturnValue({
      webhookEndpoint: '/api/revalidate',
      allowedIPs: ['127.0.0.1'],
      rateLimit: { maxRequests: 30, windowMs: 60000 }
    })
    
    mockGetConfigSummary.mockReturnValue({
      status: 'configured',
      endpoints: 2,
      security: 'enabled'
    })
    
    mockValidateConfig.mockReturnValue({
      valid: true,
      errors: []
    })
    
    mockGetStatistics.mockReturnValue({
      totalRequests: 150,
      successfulRequests: 140,
      failedRequests: 10,
      averageResponseTime: 250
    })
    
    mockGetStats.mockReturnValue({
      blockedRequests: 5,
      rateLimitViolations: 3
    })
  })

  describe('GET /api/webhook/admin', () => {
    describe('authentication', () => {
      it('should reject requests without secret header', async () => {
        const request = createMockRequest('GET')

        const response = await GET(request)
        const responseData = await response.json()

        expect(response.status).toBe(401)
        expect(responseData).toEqual({ error: 'Unauthorized' })
      })

      it('should reject requests with invalid secret', async () => {
        const request = createMockRequest('GET', {}, undefined, {
          'X-Headless-Secret-Key': 'invalid-secret'
        })

        const response = await GET(request)
        const responseData = await response.json()

        expect(response.status).toBe(401)
        expect(responseData).toEqual({ error: 'Unauthorized' })
      })

      it('should accept requests with valid secret', async () => {
        const request = createMockRequest('GET', {}, undefined, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await GET(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData).toHaveProperty('status', 'ok')
      })
    })

    describe('config action', () => {
      it('should return configuration data', async () => {
        const request = createMockRequest('GET', { action: 'config' }, undefined, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await GET(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData).toMatchObject({
          config: expect.objectContaining({
            webhookEndpoint: '/api/revalidate',
            allowedIPs: ['127.0.0.1']
          }),
          summary: expect.objectContaining({
            status: 'configured',
            endpoints: 2
          }),
          validation: expect.objectContaining({
            valid: true,
            errors: []
          })
        })
      })
    })

    describe('stats action', () => {
      it('should return webhook statistics', async () => {
        const request = createMockRequest('GET', { action: 'stats' }, undefined, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await GET(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData).toMatchObject({
          webhook: expect.objectContaining({
            totalRequests: 150,
            successfulRequests: 140,
            failedRequests: 10,
            blockedRequests: 5,
            rateLimitViolations: 3
          }),
          config: expect.objectContaining({
            status: 'configured',
            endpoints: 2
          })
        })
      })
    })

    describe('logs action', () => {
      it('should return recent logs with default limit', async () => {
        const mockLogs = [
          { id: 1, timestamp: '2023-01-01T00:00:00Z', message: 'Log 1' },
          { id: 2, timestamp: '2023-01-01T01:00:00Z', message: 'Log 2' }
        ]
        
        mockGetRecentLogs.mockReturnValue(mockLogs)

        const request = createMockRequest('GET', { action: 'logs' }, undefined, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await GET(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData).toEqual({
          logs: mockLogs,
          total: 2
        })
        expect(mockGetRecentLogs).toHaveBeenCalledWith(50) // default limit
      })

      it('should respect custom limit parameter', async () => {
        const mockLogs = [
          { id: 1, timestamp: '2023-01-01T00:00:00Z', message: 'Log 1' }
        ]
        
        mockGetRecentLogs.mockReturnValue(mockLogs)

        const request = createMockRequest('GET', { action: 'logs', limit: '10' }, undefined, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await GET(request)

        expect(mockGetRecentLogs).toHaveBeenCalledWith(10)
      })

      it('should enforce maximum limit', async () => {
        mockGetRecentLogs.mockReturnValue([])

        const request = createMockRequest('GET', { action: 'logs', limit: '200' }, undefined, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        await GET(request)

        expect(mockGetRecentLogs).toHaveBeenCalledWith(100) // max limit
      })
    })

    describe('export action', () => {
      it('should export configuration', async () => {
        const mockConfig = { setting1: 'value1', setting2: 'value2' }
        mockExportConfig.mockReturnValue(mockConfig)

        const request = createMockRequest('GET', { action: 'export' }, undefined, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await GET(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData).toMatchObject({
          config: mockConfig,
          timestamp: expect.any(String),
          version: expect.any(String)
        })
      })
    })

    describe('default action', () => {
      it('should return status and available actions', async () => {
        const request = createMockRequest('GET', {}, undefined, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await GET(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData).toMatchObject({
          status: 'ok',
          timestamp: expect.any(String),
          version: expect.any(String),
          availableActions: ['config', 'stats', 'logs', 'export']
        })
      })
    })

    describe('error handling', () => {
      it('should handle internal errors gracefully', async () => {
        mockGetConfig.mockImplementation(() => {
          throw new Error('Internal error')
        })

        const request = createMockRequest('GET', { action: 'config' }, undefined, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await GET(request)
        const responseData = await response.json()

        expect(response.status).toBe(500)
        expect(responseData).toEqual({ error: 'Internal server error' })
      })
    })
  })

  describe('POST /api/webhook/admin', () => {
    describe('authentication', () => {
      it('should reject requests without secret header', async () => {
        const request = createMockRequest('POST', {}, { action: 'update-config' })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(401)
        expect(responseData).toEqual({ error: 'Unauthorized' })
      })
    })

    describe('update-config action', () => {
      it('should update configuration successfully', async () => {
        const configData = {
          webhookEndpoint: '/api/new-revalidate',
          allowedIPs: ['192.168.1.1']
        }

        mockValidateConfig.mockReturnValue({ valid: true, errors: [] })

        const request = createMockRequest('POST', {}, {
          action: 'update-config',
          data: configData
        }, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData).toMatchObject({
          success: true,
          message: 'Configuration updated successfully',
          config: expect.any(Object)
        })
        expect(mockUpdateConfig).toHaveBeenCalledWith(configData)
      })

      it('should reject invalid configuration', async () => {
        const configData = { invalidSetting: 'value' }

        mockValidateConfig.mockReturnValue({
          valid: false,
          errors: ['Invalid setting: invalidSetting']
        })

        const request = createMockRequest('POST', {}, {
          action: 'update-config',
          data: configData
        }, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(400)
        expect(responseData).toMatchObject({
          error: 'Invalid configuration',
          details: ['Invalid setting: invalidSetting']
        })
      })

      it('should require config data', async () => {
        const request = createMockRequest('POST', {}, {
          action: 'update-config'
        }, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(400)
        expect(responseData).toEqual({ error: 'Config data required' })
      })
    })

    describe('import-config action', () => {
      it('should import configuration successfully', async () => {
        const configString = '{"setting1":"value1"}'

        mockImportConfig.mockReturnValue({
          success: true,
          error: null
        })

        const request = createMockRequest('POST', {}, {
          action: 'import-config',
          data: { config: configString }
        }, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData).toMatchObject({
          success: true,
          message: 'Configuration imported successfully'
        })
        expect(mockImportConfig).toHaveBeenCalledWith(configString)
      })

      it('should handle import failure', async () => {
        mockImportConfig.mockReturnValue({
          success: false,
          error: 'Invalid configuration format'
        })

        const request = createMockRequest('POST', {}, {
          action: 'import-config',
          data: { config: 'invalid' }
        }, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(400)
        expect(responseData).toMatchObject({
          error: 'Import failed',
          details: 'Invalid configuration format'
        })
      })

      it('should require config data', async () => {
        const request = createMockRequest('POST', {}, {
          action: 'import-config'
        }, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(400)
        expect(responseData).toEqual({ error: 'Config string required' })
      })
    })

    describe('clear-logs action', () => {
      it('should clear logs successfully', async () => {
        const request = createMockRequest('POST', {}, {
          action: 'clear-logs'
        }, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData).toMatchObject({
          success: true,
          message: 'Logs cleared successfully'
        })
        expect(mockClear).toHaveBeenCalled()
      })
    })

    describe('test-webhook action', () => {
      it('should handle test webhook request', async () => {
        const testData = { message: 'Test message' }

        const request = createMockRequest('POST', {}, {
          action: 'test-webhook',
          data: testData
        }, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData).toMatchObject({
          success: true,
          message: 'Test webhook functionality not implemented yet',
          payload: expect.objectContaining({
            action: 'admin_test',
            testData
          })
        })
      })
    })

    describe('unknown action', () => {
      it('should reject unknown actions', async () => {
        const request = createMockRequest('POST', {}, {
          action: 'unknown-action'
        }, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(400)
        expect(responseData).toMatchObject({
          error: 'Unknown action',
          availableActions: ['update-config', 'import-config', 'clear-logs', 'test-webhook']
        })
      })
    })

    describe('error handling', () => {
      it('should handle JSON parse errors', async () => {
        const request = {
          ...createMockRequest('POST', {}, undefined, {
            'X-Headless-Secret-Key': 'admin-secret'
          }),
          json: async () => { throw new Error('Invalid JSON') }
        } as NextRequest

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(500)
        expect(responseData).toMatchObject({
          error: 'Internal server error',
          details: expect.any(String)
        })
      })

      it('should handle unexpected errors', async () => {
        mockUpdateConfig.mockImplementation(() => {
          throw new Error('Unexpected error')
        })

        const request = createMockRequest('POST', {}, {
          action: 'update-config',
          data: { setting: 'value' }
        }, {
          'X-Headless-Secret-Key': 'admin-secret'
        })

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(500)
        expect(responseData).toMatchObject({
          error: 'Internal server error',
          details: 'Unexpected error'
        })
      })
    })
  })
})