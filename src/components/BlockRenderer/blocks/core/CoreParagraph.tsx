'use client';

import React from 'react';
import type { BlockComponentProps, ParagraphBlock } from '@/types/blocks';
import { InnerBlocksRenderer } from '../../BlockRenderer';

interface CoreParagraphProps extends BlockComponentProps<ParagraphBlock> {}

export function CoreParagraph({ 
  block, 
  attributes, 
  innerHTML,
  innerBlocks, 
  className,
  isNested = false 
}: CoreParagraphProps) {
  const {
    content = '',
    dropCap = false,
    textColor,
    backgroundColor,
    fontSize,
    style
  } = attributes;

  // Build dynamic styles
  const paragraphStyles: React.CSSProperties = {
    ...(textColor && { color: textColor }),
    ...(backgroundColor && { backgroundColor }),
    ...(fontSize && { fontSize }),
    ...(style?.color?.text && { color: style.color.text }),
    ...(style?.color?.background && { backgroundColor: style.color.background }),
    ...(style?.typography?.fontSize && { fontSize: style.typography.fontSize }),
    ...(style?.typography?.lineHeight && { lineHeight: style.typography.lineHeight })
  };

  // Build CSS classes
  const cssClasses = [
    'wp-block-paragraph',
    dropCap && 'has-drop-cap',
    textColor && `has-${textColor}-color`,
    backgroundColor && `has-${backgroundColor}-background-color`,
    fontSize && `has-${fontSize}-font-size`,
    className
  ].filter(Boolean).join(' ');

  // Use innerHTML if available (from WordPress), otherwise use content
  const paragraphContent = innerHTML || content;

  // Handle empty paragraph
  if (!paragraphContent && (!innerBlocks || innerBlocks.length === 0)) {
    // In edit mode or development, show placeholder
    if (process.env.NODE_ENV === 'development') {
      return (
        <p 
          className={`${cssClasses} text-gray-400 italic`}
          style={paragraphStyles}
          data-block-name={block.name}
          data-empty-paragraph
        >
          Empty paragraph
        </p>
      );
    }
    return null;
  }

  return (
    <p 
      className={cssClasses}
      style={paragraphStyles}
      data-block-name={block.name}
      {...(paragraphContent && {
        dangerouslySetInnerHTML: { __html: paragraphContent }
      })}
    >
      {!paragraphContent && innerBlocks && (
        <InnerBlocksRenderer blocks={innerBlocks} parentBlock={block} />
      )}
    </p>
  );
}

export default CoreParagraph;