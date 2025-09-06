import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: () => new Map(),
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  draftMode: () => ({ isEnabled: false }),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_WORDPRESS_API_URL = 'https://example.com/wp'
process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com'
process.env.NEXT_PUBLIC_SITE_NAME = 'Test Site'
process.env.HEADLESS_SECRET = 'test-secret'

// Global test utilities
global.fetch = jest.fn()

// Suppress console.warn and console.error in tests unless explicitly testing them
const originalWarn = console.warn
const originalError = console.error

beforeAll(() => {
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
})

// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks()
})