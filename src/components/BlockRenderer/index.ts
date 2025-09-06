/**
 * WordPress Block Renderer System
 * 
 * A comprehensive system for rendering WordPress Gutenberg blocks and ACF flexible content
 * in React/Next.js applications with TypeScript support.
 * 
 * Features:
 * - Support for Gutenberg core blocks and custom ACF blocks
 * - Extensible block registry system
 * - Error boundaries and fallback components
 * - TypeScript definitions for all block types
 * - Utility functions for block parsing and processing
 */

// Main Components
export { BlockRenderer, InnerBlocksRenderer, useBlockRenderer } from './BlockRenderer';
export { BlockRegistry } from './BlockRegistry';
export { BlockErrorBoundary, withBlockErrorBoundary, useBlockErrorHandler } from './BlockErrorBoundary';
export { 
  BlockFallback, 
  MissingBlockFallback, 
  BlockLoadingFallback, 
  UnsupportedBlockFallback 
} from './BlockFallback';

// Block Registration
export { 
  registerDefaultBlocks, 
  registerExtendedCoreBlocks, 
  registerEmbedBlocks, 
  initializeBlocks 
} from './registerBlocks';

// Core Block Components
export { CoreParagraph } from './blocks/core/CoreParagraph';
export { CoreHeading } from './blocks/core/CoreHeading';
export { CoreImage } from './blocks/core/CoreImage';
export { CoreList } from './blocks/core/CoreList';
export { CoreButton } from './blocks/core/CoreButton';
export { CoreColumns } from './blocks/core/CoreColumns';
export { CoreColumn } from './blocks/core/CoreColumn';

// ACF Block Components
export { ACFHeroBlock } from './blocks/acf/HeroBlock';
export { ACFTestimonialBlock } from './blocks/acf/TestimonialBlock';
export { ACFCTABlock } from './blocks/acf/CTABlock';

// Utility Functions
export {
  parseBlocks,
  extractBlockAttributes,
  blocksToContent,
  blockToContent,
  sanitizeBlockContent,
  getBlockTypeStats
} from '@/utils/blockParser';

// Types
export type {
  Block,
  BaseBlock,
  GutenbergBlock,
  ACFBlock,
  ACFFlexibleContentBlock,
  BlockComponentProps,
  BlockRendererProps,
  BlockErrorBoundaryProps,
  BlockRegistration,
  BlockRegistry as IBlockRegistry,
  BlockName,
  BlockParserOptions,
  ParsedBlockData,
  // Specific block types
  ParagraphBlock,
  HeadingBlock,
  ImageBlock,
  ListBlock,
  QuoteBlock,
  CodeBlock,
  EmbedBlock,
  ButtonBlock,
  ButtonsBlock,
  ColumnsBlock,
  ColumnBlock,
  GroupBlock,
  MediaTextBlock,
  CoverBlock,
  GalleryBlock,
  HeroBlock,
  TestimonialBlock,
  CtaBlock
} from '@/types/blocks';

// Default export for convenience
export { BlockRenderer as default } from './BlockRenderer';