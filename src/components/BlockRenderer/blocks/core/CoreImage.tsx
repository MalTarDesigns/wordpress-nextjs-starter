'use client';

import React from 'react';
import Image from 'next/image';
import type { BlockComponentProps, ImageBlock } from '@/types/blocks';

interface CoreImageProps extends BlockComponentProps<ImageBlock> {}

export function CoreImage({ 
  block, 
  attributes, 
  className,
  isNested = false 
}: CoreImageProps) {
  const {
    id,
    url,
    alt = '',
    caption,
    title,
    href,
    rel,
    linkClass,
    linkTarget,
    width,
    height,
    sizeSlug,
    linkDestination,
    align
  } = attributes;

  // Handle missing URL
  if (!url) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div 
          className="wp-block-image bg-gray-100 border-2 border-dashed border-gray-300 p-8 text-center text-gray-500"
          data-block-name={block.name}
          data-missing-image
        >
          <p>Missing image URL</p>
          {id && <p className="text-xs">Image ID: {id}</p>}
        </div>
      );
    }
    return null;
  }

  // Build CSS classes
  const cssClasses = [
    'wp-block-image',
    align && `align${align}`,
    align && align !== 'center' && `wp-image-${id}`,
    sizeSlug && `size-${sizeSlug}`,
    className
  ].filter(Boolean).join(' ');

  // Build image wrapper classes
  const figureClasses = [
    cssClasses,
    align === 'wide' && 'alignwide',
    align === 'full' && 'alignfull'
  ].filter(Boolean).join(' ');

  // Image component props
  const imageProps = {
    src: url,
    alt: alt || '',
    ...(title && { title }),
    ...(width && height && { 
      width: Number(width), 
      height: Number(height) 
    }),
    className: `wp-image-${id || 'unknown'}`,
    'data-block-name': block.name
  };

  // Link wrapper if specified
  const ImageElement = (
    <>
      {width && height ? (
        <Image
          {...imageProps}
          width={Number(width)}
          height={Number(height)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={!isNested}
        />
      ) : (
        // Fallback to regular img tag if dimensions are not available
        // eslint-disable-next-line @next/next/no-img-element
        <img {...imageProps} />
      )}
    </>
  );

  const LinkedImageElement = href ? (
    <a 
      href={href}
      {...(linkTarget && { target: linkTarget })}
      {...(rel && { rel })}
      {...(linkClass && { className: linkClass })}
      {...(linkTarget === '_blank' && { rel: 'noopener noreferrer' })}
    >
      {ImageElement}
    </a>
  ) : ImageElement;

  // Return with or without caption
  if (caption) {
    return (
      <figure className={figureClasses} data-block-name={block.name}>
        {LinkedImageElement}
        <figcaption 
          className="wp-element-caption"
          dangerouslySetInnerHTML={{ __html: caption }}
        />
      </figure>
    );
  }

  return (
    <div className={figureClasses} data-block-name={block.name}>
      {LinkedImageElement}
    </div>
  );
}

export default CoreImage;