# Contributing to WordPress Next.js Starter

We welcome contributions from the community! This guide will help you get started with contributing to this WordPress headless CMS starter template.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Code Standards](#code-standards)
5. [Testing Requirements](#testing-requirements)
6. [Pull Request Process](#pull-request-process)
7. [Issue Reporting](#issue-reporting)
8. [Feature Requests](#feature-requests)
9. [Documentation](#documentation)
10. [Community Guidelines](#community-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

**Our Standards:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- **Node.js** 18+ installed
- **pnpm** package manager (recommended over npm)
- **Git** for version control
- **WordPress** site for testing (can be local or remote)
- Basic knowledge of **TypeScript**, **React**, and **Next.js**

### Development Workflow

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** for your changes
4. **Make your changes** following our code standards
5. **Test your changes** thoroughly
6. **Submit a pull request** with a clear description

## Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/wordpress-next-starter.git
cd wordpress-next-starter

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your WordPress credentials
```

### 2. Development Environment

```bash
# Validate environment configuration
pnpm validate-env

# Generate TypeScript types from WordPress
pnpm codegen

# Start development server
pnpm dev

# In another terminal, start type checking watch
pnpm codegen:watch
```

### 3. Testing Setup

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage
```

## Code Standards

### TypeScript Requirements

- **Strict mode enabled**: All code must pass TypeScript strict checks
- **Comprehensive typing**: Avoid `any` types, use proper interfaces
- **Type definitions**: Update type files when adding new features
- **JSDoc comments**: Document complex functions and interfaces

```typescript
// ✅ Good - Well-typed interface
interface WordPressPost {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
  author: {
    name: string;
    avatar?: string;
  };
}

// ❌ Avoid - Using any type
function processData(data: any): any {
  return data;
}

// ✅ Good - Generic with constraints
function processData<T extends Record<string, unknown>>(data: T): T {
  return data;
}
```

### React Component Standards

- **Functional components**: Use function declarations over arrow functions
- **TypeScript props**: Always type component props
- **Error boundaries**: Implement error handling for fallbacks
- **Performance**: Use React.memo, useMemo, useCallback appropriately

```tsx
// ✅ Good - Well-structured component
interface BlogPostProps {
  post: WordPressPost;
  showAuthor?: boolean;
  className?: string;
}

export function BlogPost({ post, showAuthor = true, className }: BlogPostProps) {
  return (
    <article className={cn('blog-post', className)}>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      {showAuthor && <AuthorBio author={post.author} />}
    </article>
  );
}
```

### CSS and Styling

- **Tailwind CSS**: Use Tailwind utilities for styling
- **CSS variables**: Use theme variables for consistent colors
- **Responsive design**: Mobile-first approach with responsive classes
- **Accessibility**: Follow WCAG guidelines for color contrast and navigation

```tsx
// ✅ Good - Tailwind with theme variables
<div className="bg-background text-foreground rounded-lg p-6 shadow-md dark:shadow-lg">
  <h2 className="text-xl font-semibold text-primary">Title</h2>
  <p className="text-muted-foreground mt-2">Description</p>
</div>
```

### File and Folder Structure

- **PascalCase**: Components and type files
- **camelCase**: Utility functions and hooks
- **kebab-case**: Route files and configuration
- **Barrel exports**: Use index.ts files for clean imports

```
src/
├── components/
│   ├── Templates/
│   │   ├── Page/
│   │   │   ├── PageTemplate.tsx
│   │   │   ├── PageTemplate.test.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── useWordPress.ts
│   ├── useSearch.ts
│   └── index.ts
```

## Testing Requirements

### Coverage Thresholds

All code changes must maintain minimum test coverage:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Testing Types Required

#### 1. Unit Tests
Test individual functions and utilities in isolation:

```typescript
// __tests__/unit/utils/fetchGraphQL.test.ts
describe('fetchGraphQL', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should fetch data successfully', async () => {
    fetch.mockResponseOnce(JSON.stringify({
      data: { posts: { nodes: [] } }
    }));

    const result = await fetchGraphQL('query { posts { nodes { id } } }');
    
    expect(result).toEqual({ posts: { nodes: [] } });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/graphql'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('should handle errors gracefully', async () => {
    fetch.mockRejectOnce(new Error('Network error'));

    await expect(fetchGraphQL('invalid query'))
      .rejects.toThrow('Network error');
  });
});
```

#### 2. Component Tests
Test React components with user interactions:

```typescript
// __tests__/components/BlogPost.test.tsx
import { render, screen } from '@testing-library/react';
import { BlogPost } from '@/components/BlogPost';

const mockPost = {
  id: '1',
  title: 'Test Post',
  content: '<p>Test content</p>',
  author: { name: 'John Doe' }
};

describe('BlogPost', () => {
  it('should render post title and content', () => {
    render(<BlogPost post={mockPost} />);
    
    expect(screen.getByRole('heading', { name: 'Test Post' })).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should conditionally show author', () => {
    render(<BlogPost post={mockPost} showAuthor={false} />);
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});
```

#### 3. Integration Tests
Test component integration with external services:

```typescript
// __tests__/integration/wordpress-data.test.ts
import { server } from '../mocks/server';
import { rest } from 'msw';
import { fetchGraphQL } from '@/utils/fetchGraphQL';

describe('WordPress Integration', () => {
  it('should fetch and parse blog posts', async () => {
    server.use(
      rest.post('*/graphql', (req, res, ctx) => {
        return res(ctx.json({
          data: {
            posts: {
              nodes: [{ id: '1', title: 'Test Post' }]
            }
          }
        }));
      })
    );

    const result = await fetchGraphQL(`
      query GetPosts {
        posts {
          nodes {
            id
            title
          }
        }
      }
    `);

    expect(result.posts.nodes).toHaveLength(1);
    expect(result.posts.nodes[0].title).toBe('Test Post');
  });
});
```

#### 4. End-to-End Tests
Test complete user workflows:

```typescript
// e2e/blog-navigation.spec.ts
import { test, expect } from '@playwright/test';

test('should navigate blog pages', async ({ page }) => {
  await page.goto('/blog');
  
  // Check blog listing loads
  await expect(page.locator('h1')).toContainText('Blog');
  await expect(page.locator('[data-testid="blog-post"]')).toHaveCount.greaterThan(0);
  
  // Click first blog post
  await page.locator('[data-testid="blog-post"]').first().click();
  
  // Verify post page loads
  await expect(page.locator('article')).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
});
```

## Pull Request Process

### 1. Prepare Your Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Run tests to ensure nothing is broken
pnpm test:all

# Run linting and fix issues
pnpm lint

# Type check your code
pnpm type-check

# Build to ensure no build errors
pnpm build
```

### 2. Commit Standards

Use conventional commit format:

```bash
# Feature additions
git commit -m "feat: add WordPress block renderer component"
git commit -m "feat(api): implement webhook revalidation endpoint"

# Bug fixes
git commit -m "fix: resolve GraphQL type generation issue"
git commit -m "fix(seo): correct meta tag generation for posts"

# Documentation
git commit -m "docs: update WordPress configuration guide"
git commit -m "docs(readme): add troubleshooting section"

# Tests
git commit -m "test: add unit tests for fetchGraphQL utility"
git commit -m "test(e2e): add blog navigation test"

# Refactoring
git commit -m "refactor: extract reusable SEO component"
git commit -m "refactor(types): improve WordPress type definitions"
```

### 3. Pull Request Checklist

Before submitting your PR, ensure:

- [ ] **Tests pass**: All Jest and Playwright tests pass
- [ ] **Coverage maintained**: Code coverage meets 80% threshold
- [ ] **Linting passes**: ESLint shows no warnings or errors
- [ ] **Types valid**: TypeScript compilation succeeds
- [ ] **Build succeeds**: Production build completes without errors
- [ ] **Documentation updated**: Relevant docs are updated or added
- [ ] **Changeset added**: If applicable, add changeset for version bump

### 4. Pull Request Description Template

```markdown
## Summary
Brief description of the changes and their purpose.

## Changes
- List of specific changes made
- Including new features, fixes, or improvements

## Testing
- How the changes were tested
- Screenshots or videos for UI changes
- Test coverage information

## Documentation
- Links to updated or new documentation
- Any breaking changes that need to be communicated

## Dependencies
- Any new dependencies added
- Version updates to existing dependencies

## Checklist
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Code follows project standards
- [ ] No breaking changes (or breaking changes documented)
```

## Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** for solutions
3. **Try latest version** to ensure bug still exists
4. **Prepare reproduction** steps or examples

### Bug Report Template

```markdown
**Bug Description**
Clear and concise description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- OS: [e.g., Windows 11, macOS 12]
- Node.js version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 116]
- WordPress version: [e.g., 6.3.1]

**Additional Context**
- Error messages or logs
- Screenshots if applicable
- Any other context about the problem
```

## Feature Requests

### Before Requesting a Feature

1. **Check existing feature requests** to avoid duplicates
2. **Consider if it fits the project scope** (WordPress + Next.js headless)
3. **Think about implementation** complexity and maintenance burden
4. **Provide use cases** and examples

### Feature Request Template

```markdown
**Feature Summary**
Clear and concise description of the feature.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
Describe your ideal solution.

**Alternatives Considered**
Any alternative solutions you've considered.

**Use Cases**
Specific examples of how this would be used.

**Implementation Ideas**
Any thoughts on how this could be implemented.
```

## Documentation

### Documentation Types

- **README.md**: Project overview and quick start
- **API Documentation**: Component props, hooks, utilities
- **Setup Guides**: WordPress configuration, deployment
- **Contributing Guide**: This document
- **Code Comments**: Inline documentation for complex logic

### Writing Guidelines

- **Clear and concise**: Use simple language
- **Examples included**: Provide code examples
- **Up to date**: Keep documentation current with code changes
- **Accessible**: Consider different skill levels
- **Well structured**: Use headings, lists, and formatting

### Documentation PR Requirements

- Update relevant documentation files
- Add inline code comments for complex functions
- Include examples for new APIs
- Update TypeScript documentation comments

## Community Guidelines

### Communication

- **Be respectful**: Treat all community members with respect
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Remember that maintainers are often volunteers
- **Be inclusive**: Welcome newcomers and help them get started

### Getting Help

1. **Documentation first**: Check existing documentation
2. **Search issues**: Look for similar problems or questions
3. **Ask questions**: Use GitHub Discussions for general questions
4. **Be specific**: Provide context and details in your questions

### Recognition

We appreciate all contributions, whether they are:
- Code contributions (features, fixes, improvements)
- Documentation improvements
- Bug reports and testing
- Community support and discussions
- Translations and accessibility improvements

## Development Resources

### Useful Commands

```bash
# Development workflow
pnpm dev                    # Start development server
pnpm dev:codegen           # Generate types and start dev
pnpm codegen:watch         # Watch GraphQL schema changes

# Testing and quality
pnpm test                  # Unit and integration tests
pnpm test:watch           # Watch mode for testing
pnpm test:e2e             # End-to-end tests
pnpm lint                 # Code linting
pnpm type-check           # TypeScript validation

# Building and deployment
pnpm build                 # Production build
pnpm build:analyze        # Bundle analysis
pnpm validate-env         # Environment validation
```

### Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [WordPress Developer Documentation](https://developer.wordpress.org/)
- [WPGraphQL Documentation](https://www.wpgraphql.com/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Questions?

If you have questions about contributing, please:
1. Check this contributing guide
2. Search existing GitHub issues and discussions
3. Open a new discussion with your question
4. Tag maintainers if you need urgent help

Thank you for contributing to WordPress Next.js Starter! 🎉