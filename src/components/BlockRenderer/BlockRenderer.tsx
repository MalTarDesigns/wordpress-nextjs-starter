'use client';

import React, { Fragment, Suspense } from 'react';
import { BlockRegistry } from './BlockRegistry';
import { BlockErrorBoundary } from './BlockErrorBoundary';
import { BlockFallback } from './BlockFallback';
import { parseBlocks } from '@/utils/blockParser';
import type { 
  Block, 
  BlockRendererProps, 
  BlockComponentProps, 
  ParsedBlockData,
  BlockParserOptions 
} from '@/types/blocks';

interface BlockRendererComponentProps {
  content?: string;
  blocks?: Block[];
  className?: string;
  options?: BlockParserOptions;
  fallbackComponent?: React.ComponentType<{ error: Error; blockName?: string; block?: Block }>;
  loadingComponent?: React.ComponentType;
  onBlockError?: (error: Error, errorInfo: React.ErrorInfo, block?: Block) => void;
}

/**
 * Main BlockRenderer component that renders WordPress Gutenberg blocks and ACF flexible content
 */
export function BlockRenderer({
  content,
  blocks: providedBlocks,
  className,
  options,
  fallbackComponent,
  loadingComponent = () => <div>Loading block...</div>,
  onBlockError
}: BlockRendererComponentProps) {
  const [parsedData, setParsedData] = React.useState<ParsedBlockData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const blocks = React.useMemo(() => {
    if (providedBlocks) {
      return providedBlocks;
    }

    if (content) {
      setIsLoading(true);
      const parsed = parseBlocks(content, options);
      setParsedData(parsed);
      setIsLoading(false);
      return parsed.blocks;
    }

    return [];
  }, [content, providedBlocks, options]);

  if (isLoading && loadingComponent) {
    const LoadingComponent = loadingComponent;
    return <LoadingComponent />;
  }

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className={className} data-block-renderer>
      {parsedData?.warnings && parsedData.warnings.length > 0 && (
        <div className="block-renderer-warnings" style={{ display: 'none' }}>
          {parsedData.warnings.map((warning, index) => (
            <div key={index} data-warning={warning} />
          ))}
        </div>
      )}
      
      {blocks.map((block, index) => (
        <SingleBlockRenderer
          key={`${block.name}-${index}-${block.id || block.clientId || ''}`}
          block={block}
          index={index}
          {...(fallbackComponent && { fallbackComponent })}
          {...(onBlockError && { onError: onBlockError })}
        />
      ))}
    </div>
  );
}

/**
 * Renders a single block with error boundary and component resolution
 */
function SingleBlockRenderer({
  block,
  index = 0,
  isNested = false,
  parentBlock,
  fallbackComponent,
  onError
}: BlockRendererProps & {
  fallbackComponent?: React.ComponentType<{ error: Error; blockName?: string; block?: Block }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo, block?: Block) => void;
}) {
  const blockRegistration = BlockRegistry.getBlock(block.name);
  
  if (!blockRegistration) {
    // Try to find a similar block name (handle name variations)
    const normalizedName = normalizeBlockName(block.name);
    const fallbackRegistration = BlockRegistry.getBlock(normalizedName);
    
    if (fallbackRegistration) {
      const BlockComponent = fallbackRegistration.component;
      return (
        <BlockErrorBoundary 
          fallback={fallbackComponent || BlockFallback} 
          {...(onError && { onError })}
          block={block}
        >
          <Suspense fallback={<div>Loading block...</div>}>
            <BlockComponent
              block={block}
              attributes={getBlockAttributes(block)}
              innerHTML={getBlockInnerHTML(block) || ''}
              innerBlocks={getBlockInnerBlocks(block) || []}
              className={getBlockClassName(block) || ''}
              isNested={isNested}
              index={index}
              {...(parentBlock && { parentBlock })}
            />
          </Suspense>
        </BlockErrorBoundary>
      );
    }

    // No component found, render fallback
    return (
      <BlockFallback 
        block={block} 
        error={new Error(`No component registered for block type: ${block.name}`)}
        blockName={block.name}
      />
    );
  }

  const BlockComponent = blockRegistration.component;

  return (
    <BlockErrorBoundary 
      fallback={fallbackComponent || BlockFallback} 
      {...(onError && { onError })}
      block={block}
    >
      <Suspense fallback={<div>Loading block...</div>}>
        <BlockComponent
          block={block}
          attributes={getBlockAttributes(block)}
          innerHTML={getBlockInnerHTML(block) || ''}
          innerBlocks={getBlockInnerBlocks(block) || []}
          className={getBlockClassName(block) || ''}
          isNested={isNested}
          index={index}
          parentBlock={parentBlock}
        />
      </Suspense>
    </BlockErrorBoundary>
  );
}

/**
 * Renders inner blocks recursively
 */
export function InnerBlocksRenderer({ 
  blocks, 
  parentBlock,
  className 
}: { 
  blocks?: Block[];
  parentBlock?: Block;
  className?: string;
}) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className={className} data-inner-blocks>
      {blocks.map((block, index) => (
        <SingleBlockRenderer
          key={`inner-${block.name}-${index}-${block.id || block.clientId || ''}`}
          block={block}
          index={index}
          isNested={true}
          {...(parentBlock && { parentBlock })}
        />
      ))}
    </div>
  );
}

// Utility functions for extracting block data
function getBlockAttributes(block: Block): any {
  if ('attrs' in block) {
    return block.attrs;
  }
  if ('data' in block) {
    return block.data;
  }
  if ('attributes' in block) {
    return block.attributes;
  }
  return {};
}

function getBlockInnerHTML(block: Block): string | undefined {
  if ('innerHTML' in block) {
    return block.innerHTML;
  }
  return undefined;
}

function getBlockInnerBlocks(block: Block): Block[] | undefined {
  if ('innerBlocks' in block) {
    return block.innerBlocks;
  }
  return undefined;
}

function getBlockClassName(block: Block): string | undefined {
  const attributes = getBlockAttributes(block);
  
  // Check various possible className sources
  if (attributes.className) {
    return attributes.className;
  }
  
  if ('className' in block) {
    return block.className as string;
  }
  
  return undefined;
}

/**
 * Normalizes block names to handle variations
 */
function normalizeBlockName(blockName: string): string {
  // Handle common block name variations
  const variations: Record<string, string> = {
    'core-embed/youtube': 'core/embed',
    'core-embed/twitter': 'core/embed',
    'core-embed/instagram': 'core/embed',
    'core-embed/vimeo': 'core/embed',
    'core-embed/wordpress': 'core/embed',
    'acf/flexible-content': 'acf/flexible',
    'gutenberg/paragraph': 'core/paragraph',
    'gutenberg/heading': 'core/heading',
    'gutenberg/image': 'core/image'
  };

  return variations[blockName] || blockName;
}

// Hook for using the BlockRenderer in components
export function useBlockRenderer() {
  return {
    renderBlocks: (blocks: Block[], options?: { className?: string }) => 
      <BlockRenderer blocks={blocks} {...(options?.className && { className: options.className })} />,
    
    renderContent: (content: string, options?: BlockParserOptions & { className?: string }) =>
      <BlockRenderer content={content} {...(options && { options })} {...(options?.className && { className: options.className })} />,
    
    parseBlocks: (content: string, options?: BlockParserOptions) => parseBlocks(content, options)
  };
}

export default BlockRenderer;