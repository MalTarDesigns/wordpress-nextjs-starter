'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BlockComponentProps, HeroBlock } from '@/types/blocks';

interface HeroBlockProps extends BlockComponentProps<HeroBlock> {}

export function ACFHeroBlock({ 
  block, 
  attributes, 
  className,
  isNested = false 
}: HeroBlockProps) {
  const {
    title = '',
    subtitle = '',
    background_image,
    cta_button,
    text_color = 'light'
  } = attributes;

  // Build CSS classes
  const cssClasses = [
    'wp-block-acf-hero',
    'hero-section',
    `text-${text_color}`,
    className
  ].filter(Boolean).join(' ');

  // Text color classes
  const textColorClasses = text_color === 'light' 
    ? 'text-white' 
    : 'text-gray-900';

  return (
    <section 
      className={`${cssClasses} relative min-h-screen flex items-center justify-center overflow-hidden`}
      data-block-name={block.name}
    >
      {/* Background Image */}
      {background_image?.url && (
        <div className="absolute inset-0 z-0">
          <Image
            src={background_image.url}
            alt={background_image.alt || ''}
            fill
            className="object-cover"
            priority={!isNested}
            sizes="100vw"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {title && (
            <h1 
              className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 ${textColorClasses}`}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
          
          {subtitle && (
            <p 
              className={`text-xl md:text-2xl lg:text-3xl mb-8 ${textColorClasses} opacity-90`}
              dangerouslySetInnerHTML={{ __html: subtitle }}
            />
          )}
          
          {cta_button?.title && cta_button?.url && (
            <div className="mt-8">
              <Link
                href={cta_button.url}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-300 transform hover:scale-105"
                {...(cta_button.target && { target: cta_button.target })}
                {...(cta_button.target === '_blank' && { rel: 'noopener noreferrer' })}
              >
                {cta_button.title}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Development placeholder */}
      {process.env.NODE_ENV === 'development' && !title && !subtitle && !background_image && (
        <div className="absolute inset-0 z-20 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <h2 className="text-xl font-semibold mb-2">Hero Block</h2>
            <p>Configure title, subtitle, background image, and CTA button</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default ACFHeroBlock;