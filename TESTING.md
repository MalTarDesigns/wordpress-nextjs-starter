# Testing Guide

This WordPress Next.js starter template includes a comprehensive test suite covering unit tests, component tests, API tests, integration tests, and end-to-end tests.

## Test Structure

```
__tests__/
├── unit/
│   └── utils/
│       ├── fetchGraphQL.test.ts      # GraphQL fetching utility tests
│       ├── seoData.test.ts           # SEO metadata generation tests
│       └── blockParser.test.ts       # WordPress block parsing tests
├── components/
│   └── BlockRenderer/
│       ├── BlockRenderer.test.tsx    # Block renderer component tests
│       └── CoreParagraph.test.tsx    # Core paragraph block tests
├── api/
│   ├── revalidate.test.ts           # Revalidation API endpoint tests
│   └── webhook-admin.test.ts        # Webhook admin endpoint tests
└── integration/
    └── wordpress-data-fetching.test.ts # WordPress data integration tests

e2e/
├── page-navigation.spec.ts          # Page navigation E2E tests
├── content-rendering.spec.ts        # Content rendering E2E tests
├── seo-meta.spec.ts                # SEO and meta tags E2E tests
├── global-setup.ts                 # E2E test setup
└── global-teardown.ts              # E2E test cleanup
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- Supports both Node.js and JSDOM environments
- Configured for Next.js with automatic module mapping
- Separate projects for different test types
- 80% coverage threshold requirement

### Playwright Configuration (`playwright.config.ts`)
- Multiple browser support (Chromium, Firefox, WebKit)
- Mobile device testing
- Screenshot and video recording on failures
- Global setup and teardown

## Running Tests

### Unit and Integration Tests

```bash
# Run all Jest tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test types
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:api           # API tests only

# Run tests in CI mode
npm run test:ci
```

### End-to-End Tests

```bash
# Run all Playwright E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Run all tests (Jest + Playwright)
npm run test:all
```

## Test Categories

### 1. Unit Tests

**Location**: `__tests__/unit/`

Test individual functions and utilities in isolation:

- **fetchGraphQL**: Tests GraphQL request handling, error handling, caching strategies
- **seoData**: Tests SEO metadata generation, structured data, social media tags
- **blockParser**: Tests WordPress block parsing, validation, content processing

### 2. Component Tests

**Location**: `__tests__/components/`

Test React components with React Testing Library:

- **BlockRenderer**: Tests block rendering system, error boundaries, fallbacks
- **CoreParagraph**: Tests paragraph block component styling, attributes, accessibility

### 3. API Tests

**Location**: `__tests__/api/`

Test Next.js API routes:

- **Revalidation API**: Tests path/tag revalidation, WordPress webhooks, security
- **Webhook Admin API**: Tests webhook management, configuration, logging

### 4. Integration Tests

**Location**: `__tests__/integration/`

Test system integration with mocked external services:

- **WordPress Data Fetching**: Tests complete data flow from WordPress to rendering
- Uses MSW (Mock Service Worker) for realistic API mocking

### 5. End-to-End Tests

**Location**: `e2e/`

Test complete user workflows with real browser automation:

- **Page Navigation**: Tests routing, 404 handling, mobile responsiveness
- **Content Rendering**: Tests WordPress block rendering, images, accessibility
- **SEO Meta**: Tests meta tags, structured data, Open Graph tags

## Test Utilities and Mocking

### Mocked Dependencies

- **Next.js Functions**: `next/navigation`, `next/headers`, `next/cache`
- **External APIs**: WordPress GraphQL API (using MSW)
- **Environment Variables**: Test-specific configurations

### Test Helpers

- **MSW Server**: Mocks WordPress API responses for integration tests
- **Custom Matchers**: Jest DOM matchers for improved assertions
- **Setup Files**: Global test configuration and mocking

## Coverage Requirements

The test suite enforces minimum coverage thresholds:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Coverage reports are generated in the `coverage/` directory.

## Writing New Tests

### Unit Test Example

```typescript
import { fetchGraphQL } from '@/utils/fetchGraphQL'

describe('fetchGraphQL', () => {
  it('should fetch data successfully', async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { posts: [] } })
    })

    const result = await fetchGraphQL('query { posts { nodes { id } } }')
    
    expect(result).toEqual({ posts: [] })
    expect(fetch).toHaveBeenCalledWith(/* ... */)
  })
})
```

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react'
import { CoreParagraph } from '@/components/BlockRenderer/blocks/core/CoreParagraph'

describe('CoreParagraph', () => {
  it('should render paragraph content', () => {
    render(
      <CoreParagraph 
        block={{ name: 'core/paragraph' }}
        attributes={{ content: 'Test content' }}
        innerHTML="<p>Test content</p>"
      />
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should load homepage', async ({ page }) => {
  await page.goto('/')
  
  await expect(page).toHaveTitle(/WordPress/)
  await expect(page.locator('main')).toBeVisible()
})
```

## Environment Setup

### Required Environment Variables

For testing, set these environment variables:

```bash
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp
NEXT_PUBLIC_BASE_URL=https://your-nextjs-site.com
NEXT_PUBLIC_SITE_NAME=Your Site Name
HEADLESS_SECRET=your-webhook-secret
```

### CI/CD Integration

The test suite is designed for CI/CD environments:

- Tests run in parallel for faster execution
- Artifacts (coverage, screenshots, videos) are saved
- Exit codes properly indicate test status
- Supports headless browser testing

## Debugging Tests

### Jest Tests

```bash
# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test file
npm test -- fetchGraphQL.test.ts

# Run with verbose output
npm test -- --verbose
```

### Playwright Tests

```bash
# Debug with Playwright inspector
npx playwright test --debug

# Run specific test
npx playwright test page-navigation

# Generate test report
npx playwright show-report
```

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the expected behavior
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Clean up** after each test using `beforeEach`/`afterEach`

### Mocking Strategy

1. **Mock external dependencies** at the module level
2. **Use MSW for API mocking** in integration tests
3. **Reset mocks** between tests to avoid side effects
4. **Mock only what's necessary** for test isolation

### Performance

1. **Run tests in parallel** when possible
2. **Use test.concurrent** for independent Playwright tests
3. **Minimize test setup/teardown** time
4. **Use appropriate test timeouts**

### Accessibility Testing

1. **Test keyboard navigation** in E2E tests
2. **Verify ARIA attributes** in component tests
3. **Check color contrast** where applicable
4. **Test screen reader compatibility**

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout values or optimize test setup
2. **Flaky E2E tests**: Add proper wait conditions and stable selectors
3. **Coverage not meeting threshold**: Add tests for uncovered code paths
4. **Mock conflicts**: Ensure proper mock cleanup between tests

### Getting Help

1. Check test output for specific error messages
2. Review test artifacts (screenshots, videos) for E2E failures
3. Use debugging tools (Jest inspector, Playwright debug mode)
4. Verify environment variable configuration