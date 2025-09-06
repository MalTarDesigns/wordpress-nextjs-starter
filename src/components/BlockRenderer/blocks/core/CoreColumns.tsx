'use client';

import React from 'react';
import type { BlockComponentProps, ColumnsBlock } from '@/types/blocks';
import { InnerBlocksRenderer } from '../../BlockRenderer';

interface CoreColumnsProps extends BlockComponentProps<ColumnsBlock> {}

export function CoreColumns({ 
  block, 
  attributes, 
  innerBlocks, 
  className,
  isNested = false 
}: CoreColumnsProps) {
  const {
    verticalAlignment,
    isStackedOnMobile = true
  } = attributes;

  // Build CSS classes
  const cssClasses = [
    'wp-block-columns',
    verticalAlignment && `are-vertically-aligned-${verticalAlignment}`,
    isStackedOnMobile && 'is-stacked-on-mobile',
    className
  ].filter(Boolean).join(' ');

  // Handle empty columns
  if (!innerBlocks || innerBlocks.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div 
          className={`${cssClasses} bg-gray-100 border-2 border-dashed border-gray-300 p-4 text-center text-gray-500`}
          data-block-name={block.name}
          data-empty-columns
        >
          <p>Empty columns block</p>
          <p className="text-xs">Add column blocks as inner content</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={cssClasses} data-block-name={block.name}>
      <InnerBlocksRenderer 
        blocks={innerBlocks} 
        parentBlock={block}
        className="wp-block-columns__inner"
      />
    </div>
  );
}

export default CoreColumns;