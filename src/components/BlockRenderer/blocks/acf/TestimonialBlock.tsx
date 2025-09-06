'use client';

import React from 'react';
import Image from 'next/image';
import type { BlockComponentProps, TestimonialBlock } from '@/types/blocks';

interface TestimonialBlockProps extends BlockComponentProps<TestimonialBlock> {}

export function ACFTestimonialBlock({ 
  block, 
  attributes, 
  className,
  isNested = false 
}: TestimonialBlockProps) {
  const {
    quote = '',
    author = '',
    position = '',
    company = '',
    avatar,
    rating
  } = attributes;

  // Build CSS classes
  const cssClasses = [
    'wp-block-acf-testimonial',
    'testimonial-block',
    className
  ].filter(Boolean).join(' ');

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`star-${i}`} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half-star" className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Add empty stars to complete 5 stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" viewBox="0 0 20 20">
          <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div 
      className={`${cssClasses} bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto`}
      data-block-name={block.name}
    >
      {/* Rating */}
      {rating && rating > 0 && (
        <div className="flex items-center mb-4">
          {renderStars(rating)}
          <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
        </div>
      )}

      {/* Quote */}
      {quote && (
        <blockquote className="text-lg text-gray-800 mb-6 relative">
          <svg 
            className="absolute -top-2 -left-2 w-8 h-8 text-gray-300" 
            fill="currentColor" 
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
          <span 
            className="relative z-10"
            dangerouslySetInnerHTML={{ __html: quote }}
          />
        </blockquote>
      )}

      {/* Author Info */}
      <div className="flex items-center">
        {/* Avatar */}
        {avatar?.url && (
          <div className="flex-shrink-0 mr-4">
            <Image
              src={avatar.url}
              alt={avatar.alt || author || 'Testimonial author'}
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
          </div>
        )}

        {/* Author Details */}
        <div className="flex-grow">
          {author && (
            <div className="font-semibold text-gray-900 text-lg">
              {author}
            </div>
          )}
          
          {(position || company) && (
            <div className="text-gray-600">
              {position}
              {position && company && ', '}
              {company && (
                <span className="font-medium">{company}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Development placeholder */}
      {process.env.NODE_ENV === 'development' && !quote && !author && (
        <div className="border-2 border-dashed border-gray-300 p-4 text-center text-gray-500">
          <h3 className="font-semibold mb-2">Testimonial Block</h3>
          <p>Configure quote, author, position, company, avatar, and rating</p>
        </div>
      )}
    </div>
  );
}

export default ACFTestimonialBlock;