/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BlockRenderer, InnerBlocksRenderer, useBlockRenderer } from '@/components/BlockRenderer/BlockRenderer'
import { BlockRegistry } from '@/components/BlockRenderer/BlockRegistry'
import type { Block, GutenbergBlock } from '@/types/blocks'

// Mock the BlockRegistry
jest.mock('@/components/BlockRenderer/BlockRegistry', () => ({
  BlockRegistry: {
    getBlock: jest.fn(),
  }
}))

// Mock the parseBlocks utility
jest.mock('@/utils/blockParser', () => ({
  parseBlocks: jest.fn()
}))

const { parseBlocks } = require('@/utils/blockParser')

// Mock components
const MockParagraphComponent = ({ block, attributes, innerHTML }: any) => (
  <div data-testid="paragraph-block" data-block-name={block.name}>
    <p dangerouslySetInnerHTML={{ __html: innerHTML || attributes.content || 'Mock paragraph' }} />
  </div>
)

const MockHeadingComponent = ({ block, attributes, innerHTML }: any) => (
  <div data-testid="heading-block" data-block-name={block.name}>
    <h2 dangerouslySetInnerHTML={{ __html: innerHTML || attributes.content || 'Mock heading' }} />
  </div>
)

const MockErrorComponent = ({ error, blockName }: any) => (
  <div data-testid="error-block">
    Error: {error.message} - Block: {blockName}
  </div>
)

describe('BlockRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default registry mocks
    ;(BlockRegistry.getBlock as jest.Mock).mockImplementation((blockName: string) => {
      const components: Record<string, any> = {
        'core/paragraph': { component: MockParagraphComponent },
        'paragraph': { component: MockParagraphComponent },
        'core/heading': { component: MockHeadingComponent },
        'heading': { component: MockHeadingComponent }
      }
      return components[blockName]
    })
  })

  describe('BlockRenderer component', () => {
    it('should render empty state when no blocks provided', () => {
      render(<BlockRenderer />)
      
      const container = document.querySelector('[data-block-renderer]')
      expect(container).toBeNull()
    })

    it('should render blocks from providedBlocks prop', () => {
      const blocks: Block[] = [
        {
          name: 'core/paragraph',
          attributes: { content: 'Test paragraph' },
          innerHTML: '<p>Test paragraph</p>',
          isValid: true,
          clientId: 'test-1'
        },
        {
          name: 'core/heading',
          attributes: { content: 'Test heading', level: 2 },
          innerHTML: '<h2>Test heading</h2>',
          isValid: true,
          clientId: 'test-2'
        }
      ]

      render(<BlockRenderer blocks={blocks} />)
      
      expect(screen.getByTestId('paragraph-block')).toBeInTheDocument()
      expect(screen.getByTestId('heading-block')).toBeInTheDocument()
      expect(screen.getByText('Test paragraph')).toBeInTheDocument()
      expect(screen.getByText('Test heading')).toBeInTheDocument()
    })

    it('should parse content and render blocks', () => {
      const mockBlocks: Block[] = [
        {
          name: 'core/paragraph',
          attributes: { content: 'Parsed paragraph' },
          innerHTML: '<p>Parsed paragraph</p>',
          isValid: true,
          clientId: 'parsed-1'
        }
      ]

      parseBlocks.mockReturnValue({
        blocks: mockBlocks,
        warnings: [],
        errors: [],
        metadata: { totalBlocks: 1, blockTypes: { 'core/paragraph': 1 } }
      })

      const content = '<!-- wp:paragraph --><p>Parsed paragraph</p><!-- /wp:paragraph -->'
      
      render(<BlockRenderer content={content} />)
      
      expect(parseBlocks).toHaveBeenCalledWith(content, undefined)
      expect(screen.getByTestId('paragraph-block')).toBeInTheDocument()
      expect(screen.getByText('Parsed paragraph')).toBeInTheDocument()
    })

    it('should pass parser options to parseBlocks', () => {
      const mockBlocks: Block[] = []
      parseBlocks.mockReturnValue({
        blocks: mockBlocks,
        warnings: [],
        errors: [],
        metadata: { totalBlocks: 0, blockTypes: {} }
      })

      const options = { 
        allowedBlocks: ['core/paragraph'],
        validateAttributes: true 
      }
      
      render(<BlockRenderer content="test content" options={options} />)
      
      expect(parseBlocks).toHaveBeenCalledWith('test content', options)
    })

    it('should render warnings in development mode', () => {
      const mockBlocks: Block[] = []
      parseBlocks.mockReturnValue({
        blocks: mockBlocks,
        warnings: ['Warning 1', 'Warning 2'],
        errors: [],
        metadata: { totalBlocks: 0, blockTypes: {} }
      })

      render(<BlockRenderer content="test content" />)
      
      const warningElements = document.querySelectorAll('[data-warning]')
      expect(warningElements).toHaveLength(2)
      expect(warningElements[0]).toHaveAttribute('data-warning', 'Warning 1')
      expect(warningElements[1]).toHaveAttribute('data-warning', 'Warning 2')
    })

    it('should apply custom className', () => {
      const blocks: Block[] = [
        {
          name: 'core/paragraph',
          attributes: {},
          isValid: true,
          clientId: 'test-1'
        }
      ]

      render(<BlockRenderer blocks={blocks} className="custom-block-renderer" />)
      
      const container = screen.getByTestId('paragraph-block').closest('[data-block-renderer]')
      expect(container).toHaveClass('custom-block-renderer')
    })

    it('should handle missing block components with fallback', () => {
      ;(BlockRegistry.getBlock as jest.Mock).mockReturnValue(null)

      const blocks: Block[] = [
        {
          name: 'unknown/block',
          attributes: {},
          isValid: true,
          clientId: 'unknown-1'
        }
      ]

      render(<BlockRenderer blocks={blocks} />)
      
      expect(screen.getByText(/No component registered for block type: unknown\/block/)).toBeInTheDocument()
    })

    it('should use custom fallback component', () => {
      ;(BlockRegistry.getBlock as jest.Mock).mockReturnValue(null)

      const blocks: Block[] = [
        {
          name: 'unknown/block',
          attributes: {},
          isValid: true,
          clientId: 'unknown-1'
        }
      ]

      render(
        <BlockRenderer 
          blocks={blocks} 
          fallbackComponent={MockErrorComponent}
        />
      )
      
      expect(screen.getByTestId('error-block')).toBeInTheDocument()
    })
  })

  describe('InnerBlocksRenderer', () => {
    it('should render nothing when no blocks provided', () => {
      const { container } = render(<InnerBlocksRenderer />)
      expect(container.firstChild).toBeNull()
    })

    it('should render inner blocks recursively', () => {
      const innerBlocks: Block[] = [
        {
          name: 'core/paragraph',
          attributes: { content: 'Inner paragraph' },
          innerHTML: '<p>Inner paragraph</p>',
          isValid: true,
          clientId: 'inner-1'
        }
      ]

      const parentBlock: Block = {
        name: 'core/columns',
        attributes: {},
        isValid: true,
        clientId: 'parent-1'
      }

      render(
        <InnerBlocksRenderer 
          blocks={innerBlocks} 
          parentBlock={parentBlock}
          className="inner-blocks-container"
        />
      )
      
      const container = screen.getByTestId('paragraph-block').closest('[data-inner-blocks]')
      expect(container).toHaveClass('inner-blocks-container')
      expect(screen.getByText('Inner paragraph')).toBeInTheDocument()
    })
  })

  describe('useBlockRenderer hook', () => {
    const TestComponent = () => {
      const { renderBlocks, renderContent, parseBlocks: parseFn } = useBlockRenderer()
      
      const blocks: Block[] = [
        {
          name: 'core/paragraph',
          attributes: { content: 'Hook paragraph' },
          innerHTML: '<p>Hook paragraph</p>',
          isValid: true,
          clientId: 'hook-1'
        }
      ]

      return (
        <div>
          <div data-testid="render-blocks">
            {renderBlocks(blocks)}
          </div>
          <div data-testid="render-content">
            {renderContent('<!-- wp:paragraph --><p>Hook content</p><!-- /wp:paragraph -->')}
          </div>
        </div>
      )
    }

    it('should provide block rendering utilities', () => {
      parseBlocks.mockReturnValue({
        blocks: [{
          name: 'core/paragraph',
          attributes: { content: 'Hook content' },
          innerHTML: '<p>Hook content</p>',
          isValid: true,
          clientId: 'hook-content-1'
        }],
        warnings: [],
        errors: [],
        metadata: { totalBlocks: 1, blockTypes: { 'core/paragraph': 1 } }
      })

      render(<TestComponent />)
      
      expect(screen.getByText('Hook paragraph')).toBeInTheDocument()
      expect(screen.getByText('Hook content')).toBeInTheDocument()
    })
  })

  describe('block name normalization', () => {
    it('should handle block name variations', () => {
      ;(BlockRegistry.getBlock as jest.Mock)
        .mockReturnValueOnce(null) // First call returns null for original name
        .mockReturnValueOnce({ component: MockParagraphComponent }) // Second call returns component for normalized name

      const blocks: Block[] = [
        {
          name: 'gutenberg/paragraph',
          attributes: { content: 'Normalized paragraph' },
          innerHTML: '<p>Normalized paragraph</p>',
          isValid: true,
          clientId: 'normalized-1'
        }
      ]

      render(<BlockRenderer blocks={blocks} />)
      
      expect(screen.getByTestId('paragraph-block')).toBeInTheDocument()
      expect(screen.getByText('Normalized paragraph')).toBeInTheDocument()
      
      // Should try original name first, then normalized
      expect(BlockRegistry.getBlock).toHaveBeenCalledWith('gutenberg/paragraph')
      expect(BlockRegistry.getBlock).toHaveBeenCalledWith('core/paragraph')
    })
  })

  describe('block attribute extraction', () => {
    it('should extract attributes from different block formats', () => {
      const MockAttributeComponent = ({ attributes }: any) => (
        <div data-testid="attribute-block">
          {JSON.stringify(attributes)}
        </div>
      )

      ;(BlockRegistry.getBlock as jest.Mock).mockReturnValue({
        component: MockAttributeComponent
      })

      // Test different attribute formats
      const blocks: Block[] = [
        // Gutenberg block format
        {
          name: 'test/block',
          attrs: { testAttr: 'attrs-value' },
          attributes: { fallbackAttr: 'attributes-value' },
          isValid: true,
          clientId: 'test-1'
        } as GutenbergBlock,
        // ACF block format
        {
          name: 'test/block',
          data: { testData: 'data-value' },
          isValid: true,
          clientId: 'test-2'
        },
      ]

      const { rerender } = render(<BlockRenderer blocks={[blocks[0]]} />)
      
      expect(screen.getByText(JSON.stringify({ testAttr: 'attrs-value' }))).toBeInTheDocument()
      
      rerender(<BlockRenderer blocks={[blocks[1]]} />)
      
      expect(screen.getByText(JSON.stringify({ testData: 'data-value' }))).toBeInTheDocument()
    })
  })
})