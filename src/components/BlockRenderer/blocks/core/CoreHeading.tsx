'use client';

import React from 'react';
import type { BlockComponentProps, HeadingBlock } from '@/types/blocks';
import { InnerBlocksRenderer } from '../../BlockRenderer';

interface CoreHeadingProps extends BlockComponentProps<HeadingBlock> {}

export function CoreHeading({ 
  block, 
  attributes, 
  innerHTML,
  innerBlocks, 
  className,
  isNested = false 
}: CoreHeadingProps) {
  const {
    content = '',
    level = 2,
    textAlign,
    textColor,
    backgroundColor,
    fontSize,
    anchor
  } = attributes;

  // Build dynamic styles
  const headingStyles: React.CSSProperties = {
    ...(textAlign && { textAlign }),
    ...(textColor && { color: textColor }),
    ...(backgroundColor && { backgroundColor }),
    ...(fontSize && { fontSize })
  };

  // Build CSS classes
  const cssClasses = [
    `wp-block-heading`,
    textAlign && `has-text-align-${textAlign}`,
    textColor && `has-${textColor}-color`,
    backgroundColor && `has-${backgroundColor}-background-color`,
    fontSize && `has-${fontSize}-font-size`,
    className
  ].filter(Boolean).join(' ');

  // Use innerHTML if available (from WordPress), otherwise use content
  const headingContent = innerHTML || content;

  // Validate heading level
  const validLevel = Math.max(1, Math.min(6, level)) as 1 | 2 | 3 | 4 | 5 | 6;
  
  // Create the appropriate heading element
  const HeadingTag = `h${validLevel}` as keyof JSX.IntrinsicElements;

  // Handle empty heading
  if (!headingContent && (!innerBlocks || innerBlocks.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <HeadingTag 
          className={`${cssClasses} text-gray-400 italic`}
          style={headingStyles}
          data-block-name={block.name}
          data-empty-heading
          {...(anchor && { id: anchor })}
        >
          Empty heading
        </HeadingTag>
      );
    }
    return null;
  }

  return (
    <HeadingTag 
      className={cssClasses}
      style={headingStyles}
      data-block-name={block.name}
      {...(anchor && { id: anchor })}
      {...(headingContent && {
        dangerouslySetInnerHTML: { __html: headingContent }
      })}
    >
      {!headingContent && innerBlocks && (
        <InnerBlocksRenderer blocks={innerBlocks} parentBlock={block} />
      )}
    </HeadingTag>
  );
}

export default CoreHeading;