'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';
import type { BlockComponentProps } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface Testimonial {
  id?: number;
  quote: string;
  author_name: string;
  author_title?: string;
  author_company?: string;
  author_image?: {
    url: string;
    alt?: string;
  };
  rating?: number;
  date?: string;
  featured?: boolean;
  tags?: string[];
}

interface TestimonialSectionBlock {
  testimonials?: Testimonial[];
  layout?: 'grid' | 'carousel' | 'masonry' | 'featured';
  columns?: number;
  show_rating?: boolean;
  show_quote_icon?: boolean;
  card_style?: 'bordered' | 'elevated' | 'minimal' | 'gradient';
  background_pattern?: boolean;
  title?: string;
  subtitle?: string;
  auto_rotate?: boolean;
  rotation_interval?: number;
}

interface TestimonialSectionProps extends BlockComponentProps<TestimonialSectionBlock> {}

export function ACFTestimonialSection({ 
  block, 
  attributes, 
  className,
  isNested = false 
}: TestimonialSectionProps) {
  const {
    testimonials = [],
    layout = 'grid',
    columns = 3,
    show_rating = true,
    show_quote_icon = true,
    card_style = 'elevated',
    background_pattern = false,
    title = '',
    subtitle = '',
    auto_rotate = false,
    rotation_interval = 5000
  } = attributes;

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate for carousel
  React.useEffect(() => {
    if (layout === 'carousel' && auto_rotate && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, rotation_interval);
      
      return () => clearInterval(interval);
    }
  }, [layout, auto_rotate, rotation_interval, testimonials.length]);

  // Card style classes
  const getCardClasses = () => {
    switch (card_style) {
      case 'bordered':
        return 'border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900';
      case 'elevated':
        return 'shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-gray-900';
      case 'minimal':
        return 'bg-transparent border-l-4 border-primary pl-6';
      case 'gradient':
        return 'bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 backdrop-blur';
      default:
        return 'bg-white dark:bg-gray-900';
    }
  };

  // Render star rating
  const renderRating = (rating: number) => {
    if (!show_rating || !rating) return null;
    
    return (
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-5 h-5",
              i < rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
            )}
          />
        ))}
      </div>
    );
  };

  // Render single testimonial card
  const renderTestimonialCard = (testimonial: Testimonial, index: number) => {
    const isFeatured = testimonial.featured || (layout === 'featured' && index === 0);
    
    return (
      <Card 
        className={cn(
          getCardClasses(),
          "h-full transition-all duration-300",
          isFeatured && "lg:col-span-2 lg:row-span-2",
          card_style === 'elevated' && "hover:-translate-y-1"
        )}
      >
        <CardContent className="p-6 lg:p-8 h-full flex flex-col">
          {/* Quote Icon */}
          {show_quote_icon && (
            <Quote className="w-10 h-10 text-primary/20 mb-4" />
          )}
          
          {/* Rating */}
          {renderRating(testimonial.rating || 0)}
          
          {/* Quote */}
          <blockquote className={cn(
            "flex-grow mb-6",
            isFeatured ? "text-lg lg:text-xl" : "text-base"
          )}>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              "{testimonial.quote}"
            </p>
          </blockquote>
          
          {/* Tags */}
          {testimonial.tags && testimonial.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {testimonial.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Author */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {testimonial.author_image?.url ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.author_image.url}
                    alt={testimonial.author_image.alt || testimonial.author_name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Author Info */}
            <div className="flex-grow">
              <div className="font-semibold text-gray-900 dark:text-white">
                {testimonial.author_name}
              </div>
              {(testimonial.author_title || testimonial.author_company) && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.author_title}
                  {testimonial.author_title && testimonial.author_company && ' at '}
                  {testimonial.author_company}
                </div>
              )}
              {testimonial.date && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {testimonial.date}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render testimonials based on layout
  const renderTestimonials = () => {
    if (testimonials.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Quote className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No testimonials available</p>
        </div>
      );
    }

    switch (layout) {
      case 'carousel':
        return (
          <div className="relative max-w-4xl mx-auto">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    {renderTestimonialCard(testimonial, index)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation */}
            {testimonials.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12"
                  onClick={() => setCurrentIndex((prev) => 
                    prev === 0 ? testimonials.length - 1 : prev - 1
                  )}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12"
                  onClick={() => setCurrentIndex((prev) => 
                    (prev + 1) % testimonials.length
                  )}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                {/* Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentIndex 
                          ? "w-8 bg-primary" 
                          : "bg-gray-300 dark:bg-gray-600"
                      )}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 'masonry':
        return (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="break-inside-avoid mb-6">
                {renderTestimonialCard(testimonial, index)}
              </div>
            ))}
          </div>
        );

      case 'featured':
        const featured = testimonials[0];
        const others = testimonials.slice(1);
        
        return (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Featured testimonial */}
            <div className="lg:col-span-2">
              {featured && renderTestimonialCard(featured, 0)}
            </div>
            
            {/* Other testimonials */}
            <div className="space-y-6">
              {others.slice(0, 2).map((testimonial, index) => (
                <div key={index + 1}>
                  {renderTestimonialCard(testimonial, index + 1)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'grid':
      default:
        return (
          <div className={cn(
            "grid gap-6",
            columns === 1 && "grid-cols-1",
            columns === 2 && "grid-cols-1 md:grid-cols-2",
            columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}>
            {testimonials.map((testimonial, index) => (
              <div key={index}>
                {renderTestimonialCard(testimonial, index)}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <section 
      className={cn(
        "wp-block-acf-testimonial-section py-12 lg:py-20",
        background_pattern && "relative overflow-hidden",
        className
      )}
      data-block-name={block.name}
      data-layout={layout}
    >
      {/* Background Pattern */}
      {background_pattern && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Testimonials */}
        {renderTestimonials()}
      </div>

      {/* Development Placeholder */}
      {process.env.NODE_ENV === 'development' && testimonials.length === 0 && (
        <div className="container mx-auto px-4">
          <div className="bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Quote className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Testimonial Section Block</h3>
              <p>Add testimonials in WordPress editor</p>
              <p className="text-sm mt-2">Layout: {layout}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ACFTestimonialSection;