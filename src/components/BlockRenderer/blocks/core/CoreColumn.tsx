'use client';

import React from 'react';
import type { BlockComponentProps, ColumnBlock } from '@/types/blocks';
import { InnerBlocksRenderer } from '../../BlockRenderer';

interface CoreColumnProps extends BlockComponentProps<ColumnBlock> {}

export function CoreColumn({ 
  block, 
  attributes, 
  innerBlocks, 
  className,
  isNested = false 
}: CoreColumnProps) {
  const {
    verticalAlignment,
    width
  } = attributes;

  // Build CSS classes
  const cssClasses = [
    'wp-block-column',
    verticalAlignment && `is-vertically-aligned-${verticalAlignment}`,
    className
  ].filter(Boolean).join(' ');

  // Build inline styles for width
  const columnStyles: React.CSSProperties = {
    ...(width && { flexBasis: width })
  };

  return (
    <div 
      className={cssClasses} 
      style={columnStyles}
      data-block-name={block.name}
    >
      {innerBlocks && innerBlocks.length > 0 ? (
        <InnerBlocksRenderer 
          blocks={innerBlocks} 
          parentBlock={block}
        />
      ) : (
        // Empty column placeholder in development
        process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-50 border border-gray-200 p-4 text-center text-gray-400 text-sm">
            Empty column
          </div>
        )
      )}
    </div>
  );
}

export default CoreColumn;