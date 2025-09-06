'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn, Expand, Grid3X3 } from 'lucide-react';
import type { BlockComponentProps } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface GalleryImage {
  id: number;
  url: string;
  thumbnail?: string;
  alt?: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryBlock {
  images?: GalleryImage[];
  layout?: 'grid' | 'masonry' | 'carousel' | 'justified';
  columns?: number;
  columns_mobile?: number;
  columns_tablet?: number;
  gap?: 'none' | 'small' | 'medium' | 'large';
  image_size?: 'thumbnail' | 'medium' | 'large' | 'full';
  enable_lightbox?: boolean;
  show_captions?: boolean;
  caption_position?: 'overlay' | 'below';
  hover_effect?: 'none' | 'zoom' | 'fade' | 'slide';
  rounded_corners?: boolean;
  title?: string;
  description?: string;
}

interface ImageGalleryProps extends BlockComponentProps<ImageGalleryBlock> {}

export function ACFImageGallery({ 
  block, 
  attributes, 
  className,
  isNested = false 
}: ImageGalleryProps) {
  const {
    images = [],
    layout = 'grid',
    columns = 3,
    columns_mobile = 1,
    columns_tablet = 2,
    gap = 'medium',
    image_size = 'medium',
    enable_lightbox = true,
    show_captions = true,
    caption_position = 'overlay',
    hover_effect = 'zoom',
    rounded_corners = true,
    title = '',
    description = ''
  } = attributes;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Gap classes
  const gapClasses = {
    none: 'gap-0',
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6 lg:gap-8'
  };

  // Grid columns classes
  const getGridClasses = () => {
    const baseClasses = [];
    
    // Mobile columns
    baseClasses.push(`grid-cols-${columns_mobile}`);
    
    // Tablet columns
    baseClasses.push(`md:grid-cols-${columns_tablet}`);
    
    // Desktop columns
    baseClasses.push(`lg:grid-cols-${columns}`);
    
    return baseClasses.join(' ');
  };

  // Hover effect classes
  const getHoverClasses = () => {
    switch (hover_effect) {
      case 'zoom':
        return 'group hover:scale-105 transition-transform duration-300';
      case 'fade':
        return 'group hover:opacity-80 transition-opacity duration-300';
      case 'slide':
        return 'group hover:-translate-y-2 transition-transform duration-300';
      default:
        return 'group';
    }
  };

  const openLightbox = useCallback((index: number) => {
    if (enable_lightbox) {
      setCurrentImageIndex(index);
      setLightboxOpen(true);
    }
  }, [enable_lightbox]);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    setCurrentImageIndex((prevIndex) => {
      if (direction === 'prev') {
        return prevIndex === 0 ? images.length - 1 : prevIndex - 1;
      } else {
        return prevIndex === images.length - 1 ? 0 : prevIndex + 1;
      }
    });
  }, [images.length]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'ArrowLeft') {
        navigateLightbox('prev');
      } else if (e.key === 'ArrowRight') {
        navigateLightbox('next');
      } else if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, navigateLightbox]);

  // Render gallery based on layout
  const renderGallery = () => {
    if (images.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No images in gallery</p>
        </div>
      );
    }

    switch (layout) {
      case 'masonry':
        return (
          <div className={cn(
            "columns-1 md:columns-2 lg:columns-3 xl:columns-4",
            gapClasses[gap]
          )}>
            {images.map((image, index) => (
              <div
                key={image.id || index}
                className={cn(
                  "break-inside-avoid mb-4",
                  getHoverClasses(),
                  rounded_corners && "overflow-hidden rounded-lg"
                )}
              >
                {renderImageItem(image, index)}
              </div>
            ))}
          </div>
        );

      case 'carousel':
        return (
          <div className="relative">
            <div className="overflow-x-auto pb-4">
              <div className={cn("flex", gapClasses[gap])}>
                {images.map((image, index) => (
                  <div
                    key={image.id || index}
                    className={cn(
                      "flex-shrink-0 w-72 md:w-96",
                      getHoverClasses(),
                      rounded_corners && "overflow-hidden rounded-lg"
                    )}
                  >
                    {renderImageItem(image, index)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'justified':
        return (
          <div className={cn("flex flex-wrap", gapClasses[gap])}>
            {images.map((image, index) => {
              const aspectRatio = (image.width || 1) / (image.height || 1);
              const flexGrow = Math.round(aspectRatio * 100);
              
              return (
                <div
                  key={image.id || index}
                  className={cn(
                    "h-64",
                    getHoverClasses(),
                    rounded_corners && "overflow-hidden rounded-lg"
                  )}
                  style={{ flexGrow, flexBasis: `${flexGrow * 2}px` }}
                >
                  {renderImageItem(image, index, true)}
                </div>
              );
            })}
          </div>
        );

      case 'grid':
      default:
        return (
          <div className={cn(
            "grid",
            getGridClasses(),
            gapClasses[gap]
          )}>
            {images.map((image, index) => (
              <div
                key={image.id || index}
                className={cn(
                  getHoverClasses(),
                  rounded_corners && "overflow-hidden rounded-lg",
                  "bg-gray-100 dark:bg-gray-800"
                )}
              >
                {renderImageItem(image, index)}
              </div>
            ))}
          </div>
        );
    }
  };

  const renderImageItem = (image: GalleryImage, index: number, fillContainer = false) => {
    const imageUrl = image.url || image.thumbnail || '';
    
    return (
      <div className="relative w-full h-full">
        <div
          className={cn(
            "relative cursor-pointer",
            fillContainer ? "h-full" : "aspect-square",
            "overflow-hidden bg-gray-200 dark:bg-gray-700"
          )}
          onClick={() => openLightbox(index)}
        >
          <Image
            src={imageUrl}
            alt={image.alt || image.title || `Gallery image ${index + 1}`}
            fill
            className={cn(
              "object-cover",
              hover_effect === 'zoom' && "transition-transform duration-300 group-hover:scale-110"
            )}
            sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${100 / columns}vw`}
            loading={index < 4 ? 'eager' : 'lazy'}
          />
          
          {/* Hover Overlay */}
          {enable_lightbox && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8" />
            </div>
          )}
          
          {/* Caption Overlay */}
          {show_captions && caption_position === 'overlay' && (image.caption || image.title) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-sm font-medium line-clamp-2">
                {image.caption || image.title}
              </p>
            </div>
          )}
        </div>
        
        {/* Caption Below */}
        {show_captions && caption_position === 'below' && (image.caption || image.title) && (
          <div className="p-3 bg-white dark:bg-gray-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {image.caption || image.title}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Lightbox Component
  const renderLightbox = () => {
    if (!lightboxOpen || images.length === 0) return null;
    
    const currentImage = images[currentImageIndex];
    if (!currentImage) return null;

    return (
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95">
          <div className="relative w-full h-full min-h-[50vh]">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-50 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                  onClick={() => navigateLightbox('prev')}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                  onClick={() => navigateLightbox('next')}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Image */}
            <div className="relative w-full h-[80vh] flex items-center justify-center">
              <Image
                src={currentImage.url}
                alt={currentImage.alt || currentImage.title || ''}
                fill
                className="object-contain"
                sizes="95vw"
                priority
              />
            </div>

            {/* Caption */}
            {(currentImage.caption || currentImage.title) && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                <p className="text-white text-center max-w-3xl mx-auto">
                  {currentImage.caption || currentImage.title}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <section 
      className={cn(
        "wp-block-acf-image-gallery py-12 lg:py-16",
        className
      )}
      data-block-name={block.name}
      data-layout={layout}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        {(title || description) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Gallery */}
        {renderGallery()}

        {/* Lightbox */}
        {renderLightbox()}
      </div>

      {/* Development Placeholder */}
      {process.env.NODE_ENV === 'development' && images.length === 0 && (
        <div className="bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Grid3X3 className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Image Gallery Block</h3>
            <p>Add images in WordPress editor</p>
            <p className="text-sm mt-2">Layout: {layout}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default ACFImageGallery;