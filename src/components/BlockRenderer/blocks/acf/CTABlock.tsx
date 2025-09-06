'use client';

import React from 'react';
import Link from 'next/link';
import type { BlockComponentProps, CtaBlock } from '@/types/blocks';

interface CTABlockProps extends BlockComponentProps<CtaBlock> {}

export function ACFCTABlock({ 
  block, 
  attributes, 
  className,
  isNested = false 
}: CTABlockProps) {
  const {
    title = '',
    description = '',
    button,
    background_color = '#3B82F6',
    text_color = 'white',
    layout = 'center'
  } = attributes;

  // Build CSS classes based on layout
  const cssClasses = [
    'wp-block-acf-cta',
    'cta-block',
    'py-16 px-8 rounded-lg',
    layout === 'left' && 'text-left',
    layout === 'center' && 'text-center',
    layout === 'right' && 'text-right',
    className
  ].filter(Boolean).join(' ');

  // Build inline styles
  const blockStyles: React.CSSProperties = {
    backgroundColor: background_color,
    color: text_color
  };

  // Text color classes for better styling
  const textColorClass = text_color === 'white' ? 'text-white' : 
                        text_color === 'black' ? 'text-black' : 
                        `text-${text_color}`;

  return (
    <div 
      className={cssClasses}
      style={blockStyles}
      data-block-name={block.name}
    >
      <div className="container mx-auto max-w-4xl">
        <div className={`${layout === 'center' ? 'text-center' : layout === 'right' ? 'text-right' : 'text-left'}`}>
          {title && (
            <h2 
              className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${textColorClass}`}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
          
          {description && (
            <p 
              className={`text-lg md:text-xl mb-8 opacity-90 ${textColorClass}`}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
          
          {button?.title && button?.url && (
            <div className="mt-8">
              <Link
                href={button.url}
                className={`inline-block font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 ${
                  text_color === 'white' 
                    ? 'bg-white text-gray-900 hover:bg-gray-100' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } shadow-lg hover:shadow-xl`}
                {...(button.target && { target: button.target })}
                {...(button.target === '_blank' && { rel: 'noopener noreferrer' })}
              >
                {button.title}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Development placeholder */}
      {process.env.NODE_ENV === 'development' && !title && !description && !button && (
        <div className="absolute inset-4 bg-gray-100 bg-opacity-90 border-2 border-dashed border-gray-400 flex items-center justify-center rounded">
          <div className="text-center text-gray-700">
            <h3 className="text-xl font-semibold mb-2">CTA Block</h3>
            <p>Configure title, description, button, and styling</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ACFCTABlock;