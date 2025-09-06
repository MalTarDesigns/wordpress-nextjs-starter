'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { BlockComponentProps } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface HeroSectionBlock {
  title?: string;
  subtitle?: string;
  description?: string;
  background_image?: {
    url: string;
    alt?: string;
    id?: number;
    width?: number;
    height?: number;
  };
  overlay_opacity?: number;
  overlay_color?: string;
  text_alignment?: 'left' | 'center' | 'right';
  layout?: 'centered' | 'split' | 'minimal' | 'fullscreen';
  height?: 'auto' | 'medium' | 'large' | 'fullscreen';
  cta_buttons?: Array<{
    title: string;
    url: string;
    target?: string;
    style?: 'primary' | 'secondary' | 'outline' | 'ghost';
  }>;
  text_color?: 'light' | 'dark' | 'auto';
  enable_parallax?: boolean;
  badge_text?: string;
  features?: Array<{
    icon?: string;
    text: string;
  }>;
}

interface HeroSectionProps extends BlockComponentProps<HeroSectionBlock> {}

export function ACFHeroSection({ 
  block, 
  attributes, 
  className,
  isNested = false 
}: HeroSectionProps) {
  const {
    title = '',
    subtitle = '',
    description = '',
    background_image,
    overlay_opacity = 40,
    overlay_color = 'black',
    text_alignment = 'center',
    layout = 'centered',
    height = 'large',
    cta_buttons = [],
    text_color = 'auto',
    enable_parallax = false,
    badge_text = '',
    features = []
  } = attributes;

  // Height classes
  const heightClasses = {
    auto: 'min-h-[400px] py-20',
    medium: 'min-h-[500px] md:min-h-[600px]',
    large: 'min-h-[600px] md:min-h-[700px] lg:min-h-[800px]',
    fullscreen: 'min-h-screen'
  };

  // Text alignment classes
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  // Determine text color based on background
  const getTextColor = () => {
    if (text_color === 'light') return 'text-white';
    if (text_color === 'dark') return 'text-gray-900';
    // Auto - default to light if there's a background image
    return background_image ? 'text-white' : 'text-gray-900';
  };

  const textColorClass = getTextColor();

  // Layout-specific rendering
  const renderContent = () => {
    switch (layout) {
      case 'split':
        return (
          <div className="container mx-auto px-4 h-full">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
              <div className={cn("space-y-6", alignmentClasses[text_alignment])}>
                {badge_text && (
                  <span className={cn(
                    "inline-block px-4 py-1.5 rounded-full text-sm font-medium",
                    background_image 
                      ? "bg-white/20 backdrop-blur-sm text-white" 
                      : "bg-primary/10 text-primary"
                  )}>
                    {badge_text}
                  </span>
                )}
                
                {title && (
                  <h1 className={cn(
                    "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight",
                    textColorClass
                  )} dangerouslySetInnerHTML={{ __html: title }} />
                )}
                
                {subtitle && (
                  <p className={cn(
                    "text-xl md:text-2xl font-medium",
                    textColorClass,
                    "opacity-90"
                  )} dangerouslySetInnerHTML={{ __html: subtitle }} />
                )}
                
                {description && (
                  <p className={cn(
                    "text-base md:text-lg",
                    textColorClass,
                    "opacity-80 max-w-2xl"
                  )} dangerouslySetInnerHTML={{ __html: description }} />
                )}

                {renderCTAButtons()}
                {renderFeatures()}
              </div>
              
              <div className="hidden md:block" />
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="container mx-auto px-4">
            <div className={cn(
              "max-w-4xl mx-auto space-y-8",
              alignmentClasses[text_alignment]
            )}>
              {badge_text && (
                <span className={cn(
                  "inline-block px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider",
                  background_image 
                    ? "bg-white/10 backdrop-blur text-white" 
                    : "bg-secondary text-secondary-foreground"
                )}>
                  {badge_text}
                </span>
              )}
              
              {title && (
                <h1 className={cn(
                  "text-3xl md:text-4xl lg:text-5xl font-bold",
                  textColorClass
                )} dangerouslySetInnerHTML={{ __html: title }} />
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {renderCTAButtons()}
              </div>
            </div>
          </div>
        );

      case 'fullscreen':
        return (
          <div className="container mx-auto px-4 h-full flex items-center justify-center">
            <div className={cn(
              "max-w-5xl w-full space-y-8",
              alignmentClasses[text_alignment]
            )}>
              {badge_text && (
                <span className={cn(
                  "inline-block px-4 py-2 rounded-lg text-sm font-bold",
                  "bg-gradient-to-r from-primary to-primary/80 text-white",
                  "animate-pulse"
                )}>
                  {badge_text}
                </span>
              )}
              
              {title && (
                <h1 className={cn(
                  "text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-none",
                  textColorClass,
                  "drop-shadow-2xl"
                )} dangerouslySetInnerHTML={{ __html: title }} />
              )}
              
              {subtitle && (
                <p className={cn(
                  "text-2xl md:text-3xl lg:text-4xl font-light",
                  textColorClass,
                  "opacity-90"
                )} dangerouslySetInnerHTML={{ __html: subtitle }} />
              )}
              
              {description && (
                <p className={cn(
                  "text-lg md:text-xl max-w-3xl",
                  textColorClass,
                  "opacity-80",
                  text_alignment === 'center' && "mx-auto"
                )} dangerouslySetInnerHTML={{ __html: description }} />
              )}

              <div className="pt-8">
                {renderCTAButtons()}
              </div>
              
              {renderFeatures()}
            </div>
          </div>
        );

      case 'centered':
      default:
        return (
          <div className="container mx-auto px-4">
            <div className={cn(
              "max-w-5xl mx-auto space-y-6",
              alignmentClasses[text_alignment]
            )}>
              {badge_text && (
                <span className={cn(
                  "inline-block px-4 py-1.5 rounded-full text-sm font-semibold",
                  background_image 
                    ? "bg-white/20 backdrop-blur-sm text-white border border-white/30" 
                    : "bg-primary/10 text-primary border border-primary/20"
                )}>
                  {badge_text}
                </span>
              )}
              
              {title && (
                <h1 className={cn(
                  "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight",
                  textColorClass
                )} dangerouslySetInnerHTML={{ __html: title }} />
              )}
              
              {subtitle && (
                <p className={cn(
                  "text-xl md:text-2xl lg:text-3xl font-medium",
                  textColorClass,
                  "opacity-90"
                )} dangerouslySetInnerHTML={{ __html: subtitle }} />
              )}
              
              {description && (
                <p className={cn(
                  "text-base md:text-lg lg:text-xl max-w-3xl",
                  textColorClass,
                  "opacity-80",
                  text_alignment === 'center' && "mx-auto"
                )} dangerouslySetInnerHTML={{ __html: description }} />
              )}

              {renderCTAButtons()}
              {renderFeatures()}
            </div>
          </div>
        );
    }
  };

  const renderCTAButtons = () => {
    if (!cta_buttons || cta_buttons.length === 0) return null;

    return (
      <div className={cn(
        "flex flex-wrap gap-4 pt-4",
        text_alignment === 'center' && "justify-center",
        text_alignment === 'right' && "justify-end"
      )}>
        {cta_buttons.map((button, index) => (
          <Button
            key={index}
            variant={button.style || (index === 0 ? 'default' : 'outline')}
            size="lg"
            asChild
            className={cn(
              "font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
              index === 0 && "animate-pulse hover:animate-none"
            )}
          >
            <Link 
              href={button.url}
              {...(button.target && { target: button.target })}
              {...(button.target === '_blank' && { rel: 'noopener noreferrer' })}
            >
              {button.title}
            </Link>
          </Button>
        ))}
      </div>
    );
  };

  const renderFeatures = () => {
    if (!features || features.length === 0) return null;

    return (
      <div className={cn(
        "flex flex-wrap gap-6 pt-8",
        text_alignment === 'center' && "justify-center",
        text_alignment === 'right' && "justify-end"
      )}>
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            {feature.icon && (
              <span className={cn(
                "text-2xl",
                background_image ? "text-white/80" : "text-primary"
              )}>
                {feature.icon}
              </span>
            )}
            <span className={cn(
              "text-sm font-medium",
              textColorClass,
              "opacity-90"
            )}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section 
      className={cn(
        "wp-block-acf-hero-section relative flex items-center overflow-hidden",
        heightClasses[height],
        enable_parallax && "parallax-container",
        className
      )}
      data-block-name={block.name}
      data-layout={layout}
    >
      {/* Background Image with Parallax */}
      {background_image?.url && (
        <div className={cn(
          "absolute inset-0 z-0",
          enable_parallax && "parallax-element"
        )}>
          <Image
            src={background_image.url}
            alt={background_image.alt || ''}
            fill
            className="object-cover"
            priority={!isNested}
            sizes="100vw"
            quality={90}
          />
          
          {/* Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: overlay_color,
              opacity: overlay_opacity / 100
            }}
          />
          
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex items-center">
        {renderContent()}
      </div>

      {/* Development Placeholder */}
      {process.env.NODE_ENV === 'development' && !title && !subtitle && !background_image && (
        <div className="absolute inset-0 z-20 bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <h2 className="text-xl font-semibold mb-2">Hero Section Block</h2>
            <p>Configure hero content in WordPress</p>
            <p className="text-sm mt-2">Layout: {layout}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default ACFHeroSection;