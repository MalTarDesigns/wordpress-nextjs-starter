import type { 
  Block, 
  GutenbergBlock, 
  ACFBlock, 
  ACFFlexibleContentBlock,
  ParsedBlockData, 
  BlockParserOptions 
} from '@/types/blocks';

/**
 * Parse WordPress content into blocks
 * 
 * This function handles both Gutenberg blocks and ACF flexible content,
 * converting raw WordPress content into structured block data.
 */
export function parseBlocks(
  content: string, 
  options: BlockParserOptions = {}
): ParsedBlockData {
  const {
    allowedBlocks,
    disallowedBlocks,
    stripInvalidBlocks = true,
    validateAttributes = true
  } = options;

  const warnings: string[] = [];
  const errors: string[] = [];
  const blockTypes: Record<string, number> = {};
  let blocks: Block[] = [];

  try {
    // First, try to parse as Gutenberg blocks
    const gutenbergBlocks = parseGutenbergBlocks(content);
    
    if (gutenbergBlocks.length > 0) {
      blocks = gutenbergBlocks;
    } else {
      // Fallback: try to parse as ACF flexible content or HTML
      blocks = parseAlternativeContent(content);
    }

    // Filter blocks based on options
    if (allowedBlocks) {
      const originalLength = blocks.length;
      blocks = blocks.filter(block => allowedBlocks.includes(block.name));
      if (blocks.length !== originalLength) {
        warnings.push(`Filtered ${originalLength - blocks.length} blocks not in allowedBlocks list`);
      }
    }

    if (disallowedBlocks) {
      const originalLength = blocks.length;
      blocks = blocks.filter(block => !disallowedBlocks.includes(block.name));
      if (blocks.length !== originalLength) {
        warnings.push(`Removed ${originalLength - blocks.length} blocks from disallowedBlocks list`);
      }
    }

    // Validate and process blocks
    blocks = blocks.map((block, index) => {
      try {
        const processedBlock = validateAttributes ? validateBlockAttributes(block) : block;
        
        // Count block types
        blockTypes[block.name] = (blockTypes[block.name] || 0) + 1;
        
        return processedBlock;
      } catch (error) {
        const errorMessage = `Invalid block at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        if (stripInvalidBlocks) {
          warnings.push(errorMessage);
          return null;
        } else {
          errors.push(errorMessage);
          return block;
        }
      }
    }).filter(Boolean) as Block[];

  } catch (error) {
    const errorMessage = `Failed to parse blocks: ${error instanceof Error ? error.message : 'Unknown error'}`;
    errors.push(errorMessage);
  }

  return {
    blocks,
    warnings,
    errors,
    metadata: {
      totalBlocks: blocks.length,
      blockTypes,
      hasInvalidBlocks: errors.length > 0
    }
  };
}

/**
 * Parse Gutenberg block content
 */
function parseGutenbergBlocks(content: string): GutenbergBlock[] {
  const blocks: GutenbergBlock[] = [];
  
  // Gutenberg block comment pattern
  const blockPattern = /<!--\s*wp:([a-z][a-z0-9_-]*\/[a-z][a-z0-9_-]*)\s*(\{[^}]*\})?\s*(?:\/)?-->/g;
  const closingBlockPattern = /<!--\s*\/wp:([a-z][a-z0-9_-]*\/[a-z][a-z0-9_-]*)\s*-->/g;
  
  let match;
  const contentLength = content.length;
  let lastIndex = 0;
  
  while ((match = blockPattern.exec(content)) !== null) {
    const blockName = match[1];
    const attributesString = match[2];
    const blockStart = match.index;
    const blockHeaderEnd = blockStart + match[0].length;
    
    // Parse attributes
    let attributes = {};
    if (attributesString) {
      try {
        attributes = JSON.parse(attributesString);
      } catch (error) {
        console.warn(`Failed to parse block attributes for ${blockName}:`, attributesString);
      }
    }
    
    // Find the closing tag
    const closingPattern = new RegExp(`<!--\\s*\\/wp:${escapeRegExp(blockName)}\\s*-->`, 'g');
    closingPattern.lastIndex = blockHeaderEnd;
    const closingMatch = closingPattern.exec(content);
    
    let innerHTML = '';
    let innerContent: (string | null)[] = [];
    
    if (closingMatch) {
      // Block has closing tag - extract inner content
      innerHTML = content.substring(blockHeaderEnd, closingMatch.index).trim();
      innerContent = innerHTML ? [innerHTML] : [];
    } else if (!match[0].endsWith('/>')) {
      // Self-closing block or block without closing tag
      // Try to extract content until next block or end
      let nextBlockStart = contentLength;
      
      // Look for next block
      const nextBlockPattern = /<!--\s*wp:/g;
      nextBlockPattern.lastIndex = blockHeaderEnd;
      const nextBlockMatch = nextBlockPattern.exec(content);
      
      if (nextBlockMatch) {
        nextBlockStart = nextBlockMatch.index;
      }
      
      innerHTML = content.substring(blockHeaderEnd, nextBlockStart).trim();
      innerContent = innerHTML ? [innerHTML] : [];
    }
    
    // Parse inner blocks recursively
    const innerBlocks = innerHTML ? parseGutenbergBlocks(innerHTML) : [];
    
    const block: GutenbergBlock = {
      name: blockName,
      blockName,
      attrs: attributes,
      innerHTML,
      innerContent,
      innerBlocks: innerBlocks.length > 0 ? innerBlocks : undefined,
      isValid: true,
      clientId: generateClientId(),
      attributes: attributes
    };
    
    blocks.push(block);
  }
  
  return blocks;
}

/**
 * Parse alternative content formats (ACF, HTML, etc.)
 */
function parseAlternativeContent(content: string): Block[] {
  const blocks: Block[] = [];
  
  // Try to parse as JSON (ACF flexible content)
  try {
    const jsonData = JSON.parse(content);
    
    if (Array.isArray(jsonData)) {
      // ACF flexible content array
      jsonData.forEach((item, index) => {
        if (item.acf_fc_layout) {
          const block: ACFFlexibleContentBlock = {
            name: `acf/${item.acf_fc_layout}`,
            acf_fc_layout: item.acf_fc_layout,
            ...item
          };
          blocks.push(block);
        }
      });
    } else if (jsonData.acf_fc_layout) {
      // Single ACF flexible content item
      const block: ACFFlexibleContentBlock = {
        name: `acf/${jsonData.acf_fc_layout}`,
        acf_fc_layout: jsonData.acf_fc_layout,
        ...jsonData
      };
      blocks.push(block);
    }
  } catch (error) {
    // Not JSON, try to parse as HTML
    const htmlBlocks = parseHTMLContent(content);
    blocks.push(...htmlBlocks);
  }
  
  return blocks;
}

/**
 * Parse HTML content into generic blocks
 */
function parseHTMLContent(content: string): Block[] {
  const blocks: Block[] = [];
  
  if (!content.trim()) {
    return blocks;
  }
  
  // Create a generic HTML block
  const block: Block = {
    name: 'core/html',
    attributes: {
      content: content.trim()
    },
    innerHTML: content.trim(),
    isValid: true,
    clientId: generateClientId()
  };
  
  blocks.push(block);
  return blocks;
}

/**
 * Validate block attributes
 */
function validateBlockAttributes(block: Block): Block {
  // Basic validation - can be extended based on block type
  if (!block.name) {
    throw new Error('Block must have a name');
  }
  
  if (!isValidBlockName(block.name)) {
    throw new Error(`Invalid block name format: ${block.name}`);
  }
  
  // Ensure attributes exist
  if (!block.attributes) {
    block.attributes = {};
  }
  
  return block;
}

/**
 * Check if block name is valid
 */
function isValidBlockName(name: string): boolean {
  // Block names should follow the format: namespace/blockname
  const blockNameRegex = /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/;
  return blockNameRegex.test(name);
}

/**
 * Generate a unique client ID for blocks
 */
function generateClientId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Escape regular expression special characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract block attributes from Gutenberg block comments
 */
export function extractBlockAttributes(blockComment: string): Record<string, any> {
  const attributePattern = /\{([^}]+)\}/;
  const match = blockComment.match(attributePattern);
  
  if (!match) {
    return {};
  }
  
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    console.warn('Failed to parse block attributes:', match[1]);
    return {};
  }
}

/**
 * Convert blocks back to WordPress content
 */
export function blocksToContent(blocks: Block[]): string {
  return blocks.map(block => blockToContent(block)).join('\n\n');
}

/**
 * Convert a single block back to WordPress content
 */
export function blockToContent(block: Block): string {
  if ('blockName' in block && block.blockName) {
    // Gutenberg block
    const attributes = Object.keys(block.attrs || {}).length > 0 
      ? ` ${JSON.stringify(block.attrs)}` 
      : '';
    
    const innerHTML = block.innerHTML || '';
    
    if (innerHTML) {
      return `<!-- wp:${block.blockName}${attributes} -->\n${innerHTML}\n<!-- /wp:${block.blockName} -->`;
    } else {
      return `<!-- wp:${block.blockName}${attributes} />`;
    }
  }
  
  if ('acf_fc_layout' in block) {
    // ACF flexible content - would need to be handled by WordPress
    return `<!-- ACF Flexible Content: ${block.acf_fc_layout} -->`;
  }
  
  // Fallback to HTML
  return block.innerHTML || '';
}

/**
 * Sanitize block content
 */
export function sanitizeBlockContent(content: string): string {
  // Basic HTML sanitization - you might want to use a proper sanitization library
  return content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Get block type statistics
 */
export function getBlockTypeStats(blocks: Block[]): Record<string, number> {
  const stats: Record<string, number> = {};
  
  blocks.forEach(block => {
    stats[block.name] = (stats[block.name] || 0) + 1;
    
    // Count inner blocks recursively
    if ('innerBlocks' in block && block.innerBlocks) {
      const innerStats = getBlockTypeStats(block.innerBlocks);
      Object.keys(innerStats).forEach(blockType => {
        stats[blockType] = (stats[blockType] || 0) + innerStats[blockType];
      });
    }
  });
  
  return stats;
}