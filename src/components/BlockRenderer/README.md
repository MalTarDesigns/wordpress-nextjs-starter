# WordPress Block Renderer System

A comprehensive, extensible system for rendering WordPress Gutenberg blocks and ACF flexible content in React/Next.js applications with full TypeScript support.

## Features

- ✅ **Gutenberg Core Block Support** - Render all standard WordPress blocks
- ✅ **ACF Block Integration** - Support for Advanced Custom Fields blocks
- ✅ **ACF Flexible Content** - Handle flexible content layouts
- ✅ **TypeScript First** - Complete type definitions for all block types
- ✅ **Error Boundaries** - Graceful error handling with fallback components
- ✅ **Extensible Registry** - Easy registration of custom block components
- ✅ **Performance Optimized** - Lazy loading and efficient rendering
- ✅ **Development Mode** - Enhanced debugging and validation

## Quick Start

### 1. Basic Usage

```tsx
import BlockRenderer from '@/components/BlockRenderer';

function MyPage({ content }: { content: string }) {
  return (
    <article>
      <BlockRenderer 
        content={content}
        className="block-content"
        options={{
          validateAttributes: true,
          stripInvalidBlocks: true
        }}
      />
    </article>
  );
}
```

### 2. Rendering Block Arrays

```tsx
import { BlockRenderer } from '@/components/BlockRenderer';
import type { Block } from '@/types/blocks';

function MyComponent({ blocks }: { blocks: Block[] }) {
  return (
    <BlockRenderer 
      blocks={blocks}
      className="my-blocks"
    />
  );
}
```

### 3. Custom Error Handling

```tsx
import BlockRenderer, { BlockFallback } from '@/components/BlockRenderer';

const CustomFallback = ({ error, blockName }: { error: Error; blockName?: string }) => (
  <div className="error-block">
    <p>Failed to render {blockName}</p>
    <details>
      <summary>Error Details</summary>
      <pre>{error.message}</pre>
    </details>
  </div>
);

function MyPage({ content }: { content: string }) {
  return (
    <BlockRenderer 
      content={content}
      fallbackComponent={CustomFallback}
      onBlockError={(error, errorInfo, block) => {
        console.error('Block error:', { error, block });
      }}
    />
  );
}
```

## Supported Blocks

### Gutenberg Core Blocks

- **core/paragraph** - Text paragraphs with styling
- **core/heading** - Headings (H1-H6) with alignment and styling  
- **core/image** - Images with captions, links, and alignment
- **core/list** - Ordered and unordered lists
- **core/button** - Styled buttons with links
- **core/columns** - Multi-column layouts
- **core/column** - Individual columns within layouts
- **core/quote** - Blockquotes with citations
- **core/code** - Code blocks with syntax preservation
- **core/html** - Raw HTML content
- **core/embed** - Embedded content (YouTube, Twitter, etc.)

### ACF Custom Blocks

- **acf/hero** - Hero sections with background images and CTAs
- **acf/testimonial** - Customer testimonials with ratings and avatars
- **acf/cta** - Call-to-action sections with custom styling

## Block Registration

### Register a Custom Block

```tsx
import { BlockRegistry } from '@/components/BlockRegistry';
import type { BlockComponentProps } from '@/types/blocks';

// Create your block component
function MyCustomBlock({ block, attributes }: BlockComponentProps) {
  const { title, description } = attributes;
  
  return (
    <div className="my-custom-block">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// Register the block
BlockRegistry.registerBlock({
  name: 'custom/my-block',
  component: MyCustomBlock,
  category: 'custom',
  icon: 'block-default',
  description: 'My custom block component',
  supports: {
    html: false,
    align: ['left', 'center', 'right'],
    anchor: true,
    className: true,
    color: {
      background: true,
      text: true
    }
  }
});
```

### Bulk Registration

```tsx
import { BlockRegistry } from '@/components/BlockRegistry';

const customBlocks = [
  {
    name: 'custom/feature-grid',
    component: FeatureGridBlock,
    category: 'layout'
  },
  {
    name: 'custom/pricing-table',
    component: PricingTableBlock,
    category: 'widgets'
  }
];

BlockRegistry.registerBlocks(customBlocks);
```

## Advanced Usage

### Block Validation and Filtering

```tsx
import BlockRenderer from '@/components/BlockRenderer';

function SecurePage({ content }: { content: string }) {
  return (
    <BlockRenderer 
      content={content}
      options={{
        allowedBlocks: [
          'core/paragraph', 
          'core/heading', 
          'core/image'
        ],
        disallowedBlocks: [
          'core/html', 
          'core/embed'
        ],
        validateAttributes: true,
        stripInvalidBlocks: true
      }}
    />
  );
}
```

### Custom Block Parser

```tsx
import { parseBlocks } from '@/utils/blockParser';
import type { BlockParserOptions } from '@/types/blocks';

function useCustomBlocks(content: string) {
  const options: BlockParserOptions = {
    validateAttributes: true,
    stripInvalidBlocks: false
  };
  
  const parsed = parseBlocks(content, options);
  
  return {
    blocks: parsed.blocks,
    errors: parsed.errors,
    warnings: parsed.warnings,
    stats: parsed.metadata
  };
}
```

### Error Boundaries

```tsx
import { 
  BlockErrorBoundary, 
  withBlockErrorBoundary,
  useBlockErrorHandler 
} from '@/components/BlockRenderer';

// HOC approach
const SafeBlock = withBlockErrorBoundary(MyBlockComponent);

// Hook approach
function MyBlock({ block }: { block: Block }) {
  const { error, handleError, clearError } = useBlockErrorHandler(block);
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return <div>Block content...</div>;
}
```

## TypeScript Support

The system includes comprehensive TypeScript definitions:

```tsx
import type {
  Block,
  GutenbergBlock,
  ACFBlock,
  BlockComponentProps,
  ParagraphBlock,
  HeadingBlock,
  ImageBlock
} from '@/types/blocks';

// Typed block components
function TypedParagraph({ block, attributes }: BlockComponentProps<ParagraphBlock>) {
  // attributes is fully typed based on ParagraphBlock
  const { content, dropCap, textColor } = attributes;
  return <p className={textColor ? `has-${textColor}-color` : ''}>{content}</p>;
}

// Type guards
function isParagraphBlock(block: Block): block is ParagraphBlock {
  return block.name === 'core/paragraph';
}
```

## Development and Debugging

### Development Mode Features

- **Visual Placeholders** - Empty blocks show helpful placeholders
- **Error Details** - Detailed error information with stack traces
- **Block Validation** - Attribute validation and warnings
- **Console Logging** - Registration and processing logs

### Debug Console Access

In development, the BlockRegistry is available in the browser console:

```javascript
// Browser console
window.__BlockRegistry.getStats()
window.__BlockRegistry.getAllBlocks()
window.__BlockRegistry.exportRegistrations()
```

### Block Statistics

```tsx
import { getBlockTypeStats } from '@/utils/blockParser';
import { BlockRegistry } from '@/components/BlockRegistry';

function DebugInfo({ blocks }: { blocks: Block[] }) {
  const blockStats = getBlockTypeStats(blocks);
  const registryStats = BlockRegistry.getStats();
  
  return (
    <details>
      <summary>Block Statistics</summary>
      <pre>{JSON.stringify({ blockStats, registryStats }, null, 2)}</pre>
    </details>
  );
}
```

## Performance Optimization

### Lazy Loading

Block components are loaded lazily using React Suspense:

```tsx
// Automatic lazy loading
import BlockRenderer from '@/components/BlockRenderer';

// Custom loading component
<BlockRenderer 
  content={content}
  loadingComponent={() => <div>Loading blocks...</div>}
/>
```

### Code Splitting

```tsx
// Dynamic imports for custom blocks
const MyBlock = React.lazy(() => import('./blocks/MyBlock'));

BlockRegistry.registerBlock({
  name: 'custom/my-block',
  component: MyBlock,
  // ... other options
});
```

## Best Practices

### 1. Component Structure

```tsx
// ✅ Good - Separate template and styles
function MyBlock({ attributes }: BlockComponentProps) {
  return (
    <div className="my-block">
      <h3 className="my-block__title">{attributes.title}</h3>
      <p className="my-block__content">{attributes.content}</p>
    </div>
  );
}

// ❌ Avoid - Inline styles and mixed concerns
function BadBlock({ attributes }: BlockComponentProps) {
  return (
    <div style={{ padding: '20px', background: 'blue' }}>
      <h3>{attributes.title}</h3>
    </div>
  );
}
```

### 2. Error Handling

```tsx
// ✅ Good - Graceful error handling
function RobustBlock({ attributes }: BlockComponentProps) {
  if (!attributes.required_field) {
    if (process.env.NODE_ENV === 'development') {
      return <div>Missing required field</div>;
    }
    return null;
  }
  
  return <div>{attributes.required_field}</div>;
}
```

### 3. Accessibility

```tsx
// ✅ Good - Accessible block
function AccessibleBlock({ attributes }: BlockComponentProps) {
  return (
    <section 
      className="accessible-block"
      aria-labelledby="block-title"
      role="region"
    >
      <h2 id="block-title">{attributes.title}</h2>
      <p>{attributes.description}</p>
    </section>
  );
}
```

## API Reference

### BlockRenderer Props

```tsx
interface BlockRendererProps {
  content?: string;                    // WordPress content string
  blocks?: Block[];                    // Pre-parsed block array
  className?: string;                  // CSS class name
  options?: BlockParserOptions;        // Parser configuration
  fallbackComponent?: React.Component; // Custom error component
  loadingComponent?: React.Component;  // Custom loading component
  onBlockError?: (error: Error, errorInfo: React.ErrorInfo, block?: Block) => void;
}
```

### BlockRegistry Methods

```tsx
interface BlockRegistry {
  registerBlock(registration: BlockRegistration): void;
  registerBlocks(registrations: BlockRegistration[]): void;
  unregisterBlock(name: string): boolean;
  getBlock(name: string): BlockRegistration | undefined;
  getAllBlocks(): BlockRegistration[];
  hasBlock(name: string): boolean;
  getStats(): RegistryStats;
  clear(): void;
}
```

## Migration Guide

### From Raw HTML

```tsx
// Before
<div dangerouslySetInnerHTML={{ __html: content }} />

// After
<BlockRenderer content={content} />
```

### From Custom Parser

```tsx
// Before
const parsedBlocks = customParseFunction(content);
return parsedBlocks.map(renderBlock);

// After  
<BlockRenderer content={content} />
```

## Contributing

### Adding New Block Types

1. Create the block component in `src/components/BlockRenderer/blocks/`
2. Add TypeScript definitions to `src/types/blocks.ts`
3. Register the block in `src/components/BlockRenderer/registerBlocks.ts`
4. Add tests and documentation

### Testing Blocks

```tsx
import { render } from '@testing-library/react';
import { BlockRenderer } from '@/components/BlockRenderer';

test('renders paragraph block', () => {
  const content = '<!-- wp:paragraph --><p>Hello World</p><!-- /wp:paragraph -->';
  const { getByText } = render(<BlockRenderer content={content} />);
  expect(getByText('Hello World')).toBeInTheDocument();
});
```

## License

This BlockRenderer system is part of the WordPress Next.js Starter and follows the same license terms.