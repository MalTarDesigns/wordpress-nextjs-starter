'use client';

import React from 'react';
import type { BlockComponentProps, ListBlock } from '@/types/blocks';
import { InnerBlocksRenderer } from '../../BlockRenderer';

interface CoreListProps extends BlockComponentProps<ListBlock> {}

export function CoreList({ 
  block, 
  attributes, 
  innerHTML,
  innerBlocks, 
  className,
  isNested = false 
}: CoreListProps) {
  const {
    values = '',
    ordered = false,
    start,
    reversed = false,
    type
  } = attributes;

  // Build CSS classes
  const cssClasses = [
    'wp-block-list',
    className
  ].filter(Boolean).join(' ');

  // Use innerHTML if available (from WordPress), otherwise try to build from innerBlocks
  const listContent = innerHTML || values;

  // Determine list type - prioritize 'type' attribute, then 'ordered'
  const isOrderedList = type === 'ol' || (type !== 'ul' && ordered);
  const ListTag = isOrderedList ? 'ol' : 'ul' as keyof JSX.IntrinsicElements;

  // Handle empty list
  if (!listContent && (!innerBlocks || innerBlocks.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <ListTag 
          className={`${cssClasses} text-gray-400 italic`}
          data-block-name={block.name}
          data-empty-list
        >
          <li>Empty list</li>
        </ListTag>
      );
    }
    return null;
  }

  // Build list props
  const listProps = {
    className: cssClasses,
    'data-block-name': block.name
  } as React.HTMLAttributes<HTMLOListElement | HTMLUListElement> & { 'data-block-name': string };

  // Note: ordered list specific props (start, reversed) are now handled directly in the JSX

  return (
    <ListTag 
      className={listProps.className}
      data-block-name={listProps['data-block-name']}
      {...(isOrderedList && start && start !== 1 && { start })}
      {...(isOrderedList && reversed && { reversed: true })}
      {...(listContent && {
        dangerouslySetInnerHTML: { __html: listContent }
      })}
    >
      {!listContent && innerBlocks && innerBlocks.map((innerBlock, index) => (
        <li key={`list-item-${index}`}>
          <InnerBlocksRenderer 
            blocks={[innerBlock]} 
            parentBlock={block} 
          />
        </li>
      ))}
    </ListTag>
  );
}

export default CoreList;