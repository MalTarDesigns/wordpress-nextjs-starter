/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { CoreParagraph } from '@/components/BlockRenderer/blocks/core/CoreParagraph'
import type { ParagraphBlock } from '@/types/blocks'

// Mock the InnerBlocksRenderer
jest.mock('@/components/BlockRenderer/BlockRenderer', () => ({
  InnerBlocksRenderer: ({ blocks }: any) => (
    <div data-testid="inner-blocks">
      {blocks?.map((block: any, index: number) => (
        <div key={index} data-testid={`inner-block-${index}`}>
          {block.name}
        </div>
      ))}
    </div>
  )
}))

describe('CoreParagraph', () => {
  const mockBlock: ParagraphBlock = {
    name: 'core/paragraph',
    attributes: {},
    isValid: true,
    clientId: 'test-paragraph-1'
  }

  const defaultProps = {
    block: mockBlock,
    attributes: {},
    innerHTML: '',
    isNested: false,
    index: 0
  }

  describe('basic rendering', () => {
    it('should render paragraph with content from innerHTML', () => {
      const props = {
        ...defaultProps,
        innerHTML: '<strong>Bold content</strong> and regular text'
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toBeInTheDocument()
      expect(paragraph).toHaveClass('wp-block-paragraph')
      expect(paragraph).toHaveAttribute('data-block-name', 'core/paragraph')
      
      // Test dangerous innerHTML
      expect(paragraph.innerHTML).toBe('<strong>Bold content</strong> and regular text')
    })

    it('should render paragraph with content from attributes', () => {
      const props = {
        ...defaultProps,
        attributes: {
          content: 'Content from attributes'
        }
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph.innerHTML).toBe('Content from attributes')
    })

    it('should prioritize innerHTML over attributes content', () => {
      const props = {
        ...defaultProps,
        innerHTML: 'innerHTML content',
        attributes: {
          content: 'attributes content'
        }
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph.innerHTML).toBe('innerHTML content')
    })
  })

  describe('styling and classes', () => {
    it('should apply drop cap styling', () => {
      const props = {
        ...defaultProps,
        attributes: {
          content: 'Drop cap paragraph',
          dropCap: true
        }
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveClass('has-drop-cap')
    })

    it('should apply color classes', () => {
      const props = {
        ...defaultProps,
        attributes: {
          content: 'Colored paragraph',
          textColor: 'vivid-red',
          backgroundColor: 'pale-pink'
        }
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveClass('has-vivid-red-color')
      expect(paragraph).toHaveClass('has-pale-pink-background-color')
    })

    it('should apply font size class', () => {
      const props = {
        ...defaultProps,
        attributes: {
          content: 'Large paragraph',
          fontSize: 'large'
        }
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveClass('has-large-font-size')
    })

    it('should apply custom className', () => {
      const props = {
        ...defaultProps,
        attributes: {
          content: 'Custom class paragraph'
        },
        className: 'custom-paragraph-class'
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveClass('custom-paragraph-class')
    })

    it('should apply inline styles from attributes', () => {
      const props = {
        ...defaultProps,
        attributes: {
          content: 'Styled paragraph',
          textColor: '#ff0000',
          backgroundColor: '#00ff00',
          fontSize: '18px'
        }
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveStyle({
        color: '#ff0000',
        backgroundColor: '#00ff00',
        fontSize: '18px'
      })
    })

    it('should apply advanced styles from style object', () => {
      const props = {
        ...defaultProps,
        attributes: {
          content: 'Advanced styled paragraph',
          style: {
            color: {
              text: '#333333',
              background: '#f0f0f0'
            },
            typography: {
              fontSize: '20px',
              lineHeight: '1.6'
            }
          }
        }
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveStyle({
        color: '#333333',
        backgroundColor: '#f0f0f0',
        fontSize: '20px',
        lineHeight: '1.6'
      })
    })
  })

  describe('empty content handling', () => {
    it('should return null for empty paragraph in production', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const props = {
        ...defaultProps,
        innerHTML: '',
        attributes: {}
      }

      const { container } = render(<CoreParagraph {...props} />)
      
      expect(container.firstChild).toBeNull()

      process.env.NODE_ENV = originalNodeEnv
    })

    it('should show placeholder for empty paragraph in development', () => {
      const originalNodeEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const props = {
        ...defaultProps,
        innerHTML: '',
        attributes: {}
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveTextContent('Empty paragraph')
      expect(paragraph).toHaveClass('text-gray-400', 'italic')
      expect(paragraph).toHaveAttribute('data-empty-paragraph')

      process.env.NODE_ENV = originalNodeEnv
    })

    it('should not show placeholder when innerBlocks exist', () => {
      const props = {
        ...defaultProps,
        innerHTML: '',
        attributes: {},
        innerBlocks: [
          {
            name: 'core/image',
            attributes: {},
            isValid: true,
            clientId: 'inner-image-1'
          }
        ]
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).not.toHaveTextContent('Empty paragraph')
      expect(screen.getByTestId('inner-blocks')).toBeInTheDocument()
    })
  })

  describe('inner blocks rendering', () => {
    it('should render inner blocks when no innerHTML content', () => {
      const innerBlocks = [
        {
          name: 'core/image',
          attributes: {},
          isValid: true,
          clientId: 'inner-image-1'
        },
        {
          name: 'core/button',
          attributes: {},
          isValid: true,
          clientId: 'inner-button-1'
        }
      ]

      const props = {
        ...defaultProps,
        innerHTML: '',
        attributes: {},
        innerBlocks
      }

      render(<CoreParagraph {...props} />)
      
      expect(screen.getByTestId('inner-blocks')).toBeInTheDocument()
      expect(screen.getByTestId('inner-block-0')).toHaveTextContent('core/image')
      expect(screen.getByTestId('inner-block-1')).toHaveTextContent('core/button')
    })

    it('should not render inner blocks when innerHTML exists', () => {
      const props = {
        ...defaultProps,
        innerHTML: '<strong>Main content</strong>',
        innerBlocks: [
          {
            name: 'core/image',
            attributes: {},
            isValid: true,
            clientId: 'inner-image-1'
          }
        ]
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph.innerHTML).toBe('<strong>Main content</strong>')
      expect(screen.queryByTestId('inner-blocks')).not.toBeInTheDocument()
    })
  })

  describe('accessibility and data attributes', () => {
    it('should set proper data attributes', () => {
      const props = {
        ...defaultProps,
        innerHTML: 'Test content'
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveAttribute('data-block-name', 'core/paragraph')
    })

    it('should maintain semantic HTML structure', () => {
      const props = {
        ...defaultProps,
        innerHTML: 'Accessible paragraph content'
      }

      render(<CoreParagraph {...props} />)
      
      // Should render as proper paragraph element
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph.tagName).toBe('P')
    })
  })

  describe('edge cases', () => {
    it('should handle undefined attributes gracefully', () => {
      const props = {
        ...defaultProps,
        attributes: undefined as any,
        innerHTML: 'Content with undefined attributes'
      }

      expect(() => render(<CoreParagraph {...props} />)).not.toThrow()
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveTextContent('Content with undefined attributes')
    })

    it('should handle empty style object', () => {
      const props = {
        ...defaultProps,
        attributes: {
          content: 'Content with empty style',
          style: {}
        }
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveTextContent('Content with empty style')
    })

    it('should handle partial style objects', () => {
      const props = {
        ...defaultProps,
        attributes: {
          content: 'Content with partial style',
          style: {
            color: {
              text: '#333'
              // Missing background color
            }
            // Missing typography
          }
        }
      }

      render(<CoreParagraph {...props} />)
      
      const paragraph = screen.getByRole('paragraph')
      expect(paragraph).toHaveStyle({ color: '#333' })
    })
  })
})