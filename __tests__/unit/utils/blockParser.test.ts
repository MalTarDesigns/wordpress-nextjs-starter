/**
 * @jest-environment node
 */

import {
  parseBlocks,
  extractBlockAttributes,
  blocksToContent,
  blockToContent,
  sanitizeBlockContent,
  getBlockTypeStats
} from '@/utils/blockParser'
import type { Block, GutenbergBlock, ACFFlexibleContentBlock } from '@/types/blocks'

describe('blockParser utilities', () => {
  describe('parseBlocks', () => {
    it('should parse simple Gutenberg blocks', () => {
      const content = `
        <!-- wp:paragraph -->
        <p>Hello World</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:heading {"level":2} -->
        <h2>Test Heading</h2>
        <!-- /wp:heading -->
      `

      const result = parseBlocks(content)

      expect(result.blocks).toHaveLength(2)
      expect(result.blocks[0]).toMatchObject({
        name: 'paragraph',
        blockName: 'paragraph',
        innerHTML: '<p>Hello World</p>',
        attrs: {},
        isValid: true
      })
      expect(result.blocks[1]).toMatchObject({
        name: 'heading',
        blockName: 'heading',
        innerHTML: '<h2>Test Heading</h2>',
        attrs: { level: 2 },
        isValid: true
      })
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('should parse self-closing blocks', () => {
      const content = '<!-- wp:separator /-->'

      const result = parseBlocks(content)

      expect(result.blocks).toHaveLength(1)
      expect(result.blocks[0]).toMatchObject({
        name: 'separator',
        blockName: 'separator',
        innerHTML: '',
        attrs: {}
      })
    })

    it('should parse blocks with complex attributes', () => {
      const content = `
        <!-- wp:image {"id":123,"width":800,"height":600,"className":"custom-class"} -->
        <figure class="wp-block-image custom-class">
          <img src="example.jpg" alt="Example" width="800" height="600"/>
        </figure>
        <!-- /wp:image -->
      `

      const result = parseBlocks(content)

      expect(result.blocks[0].attrs).toEqual({
        id: 123,
        width: 800,
        height: 600,
        className: 'custom-class'
      })
    })

    it('should handle nested blocks', () => {
      const content = `
        <!-- wp:columns -->
        <div class="wp-block-columns">
          <!-- wp:column -->
          <div class="wp-block-column">
            <!-- wp:paragraph -->
            <p>Column 1 content</p>
            <!-- /wp:paragraph -->
          </div>
          <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
      `

      const result = parseBlocks(content)

      expect(result.blocks).toHaveLength(1)
      expect(result.blocks[0].name).toBe('columns')
      expect(result.blocks[0].innerBlocks).toBeDefined()
      expect(result.blocks[0].innerBlocks![0].name).toBe('column')
    })

    it('should parse ACF flexible content', () => {
      const content = JSON.stringify([
        {
          acf_fc_layout: 'hero_block',
          title: 'Hero Title',
          subtitle: 'Hero Subtitle',
          button_text: 'Click Me'
        },
        {
          acf_fc_layout: 'text_block',
          content: 'This is text content'
        }
      ])

      const result = parseBlocks(content)

      expect(result.blocks).toHaveLength(2)
      expect(result.blocks[0]).toMatchObject({
        name: 'acf/hero_block',
        acf_fc_layout: 'hero_block',
        title: 'Hero Title',
        subtitle: 'Hero Subtitle',
        button_text: 'Click Me'
      })
      expect(result.blocks[1]).toMatchObject({
        name: 'acf/text_block',
        acf_fc_layout: 'text_block',
        content: 'This is text content'
      })
    })

    it('should fallback to HTML content', () => {
      const content = '<div class="custom-content">Custom HTML content</div>'

      const result = parseBlocks(content)

      expect(result.blocks).toHaveLength(1)
      expect(result.blocks[0]).toMatchObject({
        name: 'core/html',
        innerHTML: content,
        attributes: { content }
      })
    })

    it('should handle empty content', () => {
      const result = parseBlocks('')

      expect(result.blocks).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should filter blocks based on allowedBlocks', () => {
      const content = `
        <!-- wp:paragraph -->
        <p>Paragraph</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:heading -->
        <h2>Heading</h2>
        <!-- /wp:heading -->
        
        <!-- wp:image -->
        <img src="test.jpg" />
        <!-- /wp:image -->
      `

      const result = parseBlocks(content, { 
        allowedBlocks: ['paragraph', 'heading'] 
      })

      expect(result.blocks).toHaveLength(2)
      expect(result.blocks.every(block => 
        ['paragraph', 'heading'].includes(block.name)
      )).toBe(true)
      expect(result.warnings).toContain('Filtered 1 blocks not in allowedBlocks list')
    })

    it('should filter blocks based on disallowedBlocks', () => {
      const content = `
        <!-- wp:paragraph -->
        <p>Paragraph</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:heading -->
        <h2>Heading</h2>
        <!-- /wp:heading -->
      `

      const result = parseBlocks(content, { 
        disallowedBlocks: ['heading'] 
      })

      expect(result.blocks).toHaveLength(1)
      expect(result.blocks[0].name).toBe('paragraph')
      expect(result.warnings).toContain('Removed 1 blocks from disallowedBlocks list')
    })

    it('should validate block attributes when enabled', () => {
      const content = '<!-- wp:invalid-block-name --><p>Invalid</p><!-- /wp:invalid-block-name -->'

      const result = parseBlocks(content, { 
        validateAttributes: true,
        stripInvalidBlocks: false 
      })

      expect(result.errors).toContain(
        expect.stringContaining('Invalid block name format')
      )
    })

    it('should count block types in metadata', () => {
      const content = `
        <!-- wp:paragraph -->
        <p>Paragraph 1</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:paragraph -->
        <p>Paragraph 2</p>
        <!-- /wp:paragraph -->
        
        <!-- wp:heading -->
        <h2>Heading</h2>
        <!-- /wp:heading -->
      `

      const result = parseBlocks(content)

      expect(result.metadata.totalBlocks).toBe(3)
      expect(result.metadata.blockTypes).toEqual({
        paragraph: 2,
        heading: 1
      })
    })
  })

  describe('extractBlockAttributes', () => {
    it('should extract attributes from block comment', () => {
      const blockComment = '<!-- wp:image {"id":123,"width":800} -->'
      const result = extractBlockAttributes(blockComment)

      expect(result).toEqual({
        id: 123,
        width: 800
      })
    })

    it('should return empty object when no attributes', () => {
      const blockComment = '<!-- wp:paragraph -->'
      const result = extractBlockAttributes(blockComment)

      expect(result).toEqual({})
    })

    it('should handle invalid JSON attributes', () => {
      const blockComment = '<!-- wp:block {invalid json} -->'
      const result = extractBlockAttributes(blockComment)

      expect(result).toEqual({})
    })
  })

  describe('blockToContent', () => {
    it('should convert Gutenberg block to content', () => {
      const block: GutenbergBlock = {
        name: 'paragraph',
        blockName: 'paragraph',
        attrs: { className: 'custom-class' },
        innerHTML: '<p class="custom-class">Test content</p>',
        innerContent: ['<p class="custom-class">Test content</p>'],
        isValid: true,
        clientId: 'test-id',
        attributes: { className: 'custom-class' }
      }

      const result = blockToContent(block)

      expect(result).toBe(
        '<!-- wp:paragraph {"className":"custom-class"} -->\n' +
        '<p class="custom-class">Test content</p>\n' +
        '<!-- /wp:paragraph -->'
      )
    })

    it('should handle self-closing blocks', () => {
      const block: GutenbergBlock = {
        name: 'separator',
        blockName: 'separator',
        attrs: {},
        innerHTML: '',
        innerContent: [],
        isValid: true,
        clientId: 'test-id',
        attributes: {}
      }

      const result = blockToContent(block)

      expect(result).toBe('<!-- wp:separator {} />')
    })

    it('should handle ACF flexible content blocks', () => {
      const block: ACFFlexibleContentBlock = {
        name: 'acf/hero_block',
        acf_fc_layout: 'hero_block',
        title: 'Hero Title'
      }

      const result = blockToContent(block)

      expect(result).toBe('<!-- ACF Flexible Content: hero_block -->')
    })
  })

  describe('blocksToContent', () => {
    it('should convert multiple blocks to content', () => {
      const blocks: Block[] = [
        {
          name: 'paragraph',
          innerHTML: '<p>Paragraph 1</p>',
          attributes: {},
          isValid: true,
          clientId: 'test-1'
        },
        {
          name: 'paragraph',
          innerHTML: '<p>Paragraph 2</p>',
          attributes: {},
          isValid: true,
          clientId: 'test-2'
        }
      ]

      const result = blocksToContent(blocks)

      expect(result).toContain('<p>Paragraph 1</p>')
      expect(result).toContain('<p>Paragraph 2</p>')
      expect(result.split('\n\n')).toHaveLength(2)
    })
  })

  describe('sanitizeBlockContent', () => {
    it('should remove script tags', () => {
      const content = '<p>Safe content</p><script>alert("danger")</script>'
      const result = sanitizeBlockContent(content)

      expect(result).toBe('<p>Safe content</p>')
    })

    it('should remove event handlers', () => {
      const content = '<button onclick="alert()">Click me</button>'
      const result = sanitizeBlockContent(content)

      expect(result).toBe('<button>Click me</button>')
    })

    it('should remove javascript: URLs', () => {
      const content = '<a href="javascript:alert()">Link</a>'
      const result = sanitizeBlockContent(content)

      expect(result).toBe('<a href="">Link</a>')
    })
  })

  describe('getBlockTypeStats', () => {
    it('should count block types including nested blocks', () => {
      const blocks: Block[] = [
        {
          name: 'paragraph',
          attributes: {},
          isValid: true,
          clientId: 'test-1'
        },
        {
          name: 'columns',
          attributes: {},
          isValid: true,
          clientId: 'test-2',
          innerBlocks: [
            {
              name: 'column',
              attributes: {},
              isValid: true,
              clientId: 'test-3',
              innerBlocks: [
                {
                  name: 'paragraph',
                  attributes: {},
                  isValid: true,
                  clientId: 'test-4'
                }
              ]
            }
          ]
        }
      ] as Block[]

      const result = getBlockTypeStats(blocks)

      expect(result).toEqual({
        paragraph: 2,
        columns: 1,
        column: 1
      })
    })
  })
})