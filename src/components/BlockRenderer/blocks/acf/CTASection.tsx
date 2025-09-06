'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Star, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import type { BlockComponentProps } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface CTAButton {
  title: string;
  url: string;
  target?: string;
  style?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  icon?: 'arrow' | 'star' | 'check' | 'trending' | 'zap' | 'none';
}

interface Feature {
  icon?: string;
  title: string;
  description?: string;
}

interface CTASectionBlock {
  title?: string;
  subtitle?: string;
  description?: string;
  buttons?: CTAButton[];
  layout?: 'centered' | 'split' | 'card' | 'banner' | 'minimal' | 'features';
  background_type?: 'none' | 'color' | 'gradient' | 'image' | 'pattern';
  background_color?: string;
  background_image?: {
    url: string;
    alt?: string;
  };
  overlay_opacity?: number;
  text_alignment?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large' | 'full';
  border_radius?: boolean;
  features?: Feature[];
  badge_text?: string;
  urgency_text?: string;
  show_social_proof?: boolean;
  testimonial_text?: string;
  testimonial_author?: string;
}

interface CTASectionProps extends BlockComponentProps<CTASectionBlock> {}

export function ACFCTASection({ 
  block, 
  attributes, 
  className,
  isNested = false 
}: CTASectionProps) {
  const {
    title = '',
    subtitle = '',
    description = '',
    buttons = [],
    layout = 'centered',
    background_type = 'none',
    background_color = '',
    background_image,
    overlay_opacity = 50,
    text_alignment = 'center',
    size = 'medium',
    border_radius = true,
    features = [],
    badge_text = '',
    urgency_text = '',
    show_social_proof = false,
    testimonial_text = '',
    testimonial_author = ''
  } = attributes;

  // Size classes
  const sizeClasses = {
    small: 'py-8 lg:py-12',
    medium: 'py-12 lg:py-16',
    large: 'py-16 lg:py-24',
    full: 'py-20 lg:py-32'
  };

  // Text alignment classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  // Get icon component
  const getIcon = (iconName: string) => {
    const icons = {
      arrow: ArrowRight,
      star: Star,
      check: CheckCircle,
      trending: TrendingUp,
      zap: Zap
    };
    
    return icons[iconName as keyof typeof icons] || ArrowRight;
  };

  // Get background styles
  const getBackgroundStyles = () => {
    const styles: React.CSSProperties = {};
    
    switch (background_type) {
      case 'color':
        if (background_color) {
          styles.backgroundColor = background_color;
        }
        break;
      case 'gradient':
        styles.background = background_color || 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)';
        break;
      case 'pattern':
        styles.backgroundImage = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
        break;
    }
    
    return styles;
  };

  // Determine text color based on background
  const getTextColor = () => {
    if (background_type === 'gradient' || (background_type === 'image' && background_image)) {
      return 'text-white';
    }
    return 'text-gray-900 dark:text-white';
  };

  // Render buttons
  const renderButtons = () => {
    if (buttons.length === 0) return null;

    return (
      <div className={cn(
        "flex flex-wrap gap-4 pt-6",
        text_alignment === 'center' && "justify-center",
        text_alignment === 'right' && "justify-end"
      )}>
        {buttons.map((button, index) => {
          const IconComponent = button.icon && button.icon !== 'none' ? getIcon(button.icon) : null;
          
          return (
            <Button
              key={index}
              variant={button.style || (index === 0 ? 'default' : 'outline')}
              size="lg"
              asChild
              className={cn(
                "font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group",
                index === 0 && "animate-pulse hover:animate-none"
              )}
            >
              <Link 
                href={button.url}
                {...(button.target && { target: button.target })}
                {...(button.target === '_blank' && { rel: 'noopener noreferrer' })}
              >
                {button.title}
                {IconComponent && (
                  <IconComponent className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                )}
              </Link>
            </Button>
          );
        })}
      </div>
    );
  };

  // Render features list
  const renderFeatures = () => {
    if (features.length === 0) return null;

    return (
      <div className={cn(
        "grid gap-4 pt-8",
        features.length === 1 && "grid-cols-1",
        features.length === 2 && "grid-cols-1 sm:grid-cols-2",
        features.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            {feature.icon && (
              <span className="text-2xl">{feature.icon}</span>
            )}
            <div>
              <div className="font-semibold text-sm">{feature.title}</div>
              {feature.description && (
                <div className="text-xs opacity-80">{feature.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render social proof
  const renderSocialProof = () => {
    if (!show_social_proof) return null;

    return (
      <div className="pt-8 space-y-4">
        {testimonial_text && (
          <blockquote className="text-sm italic opacity-90">
            "{testimonial_text}"
            {testimonial_author && (
              <cite className="block text-xs font-medium mt-1 not-italic">
                — {testimonial_author}
              </cite>
            )}
          </blockquote>
        )}
        
        {/* Star rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-sm opacity-80">Trusted by 10,000+ customers</span>
        </div>
      </div>
    );
  };

  // Render content based on layout
  const renderContent = () => {
    const textColor = getTextColor();
    
    const contentElements = (
      <>
        {badge_text && (
          <span className={cn(
            "inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4",
            background_type === 'gradient' || background_image
              ? "bg-white/20 backdrop-blur-sm text-white border border-white/30"
              : "bg-primary/10 text-primary border border-primary/20"
          )}>
            {badge_text}
          </span>
        )}
        
        {title && (
          <h2 className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight",
            textColor
          )}>
            {title}
          </h2>
        )}
        
        {subtitle && (
          <p className={cn(
            "text-xl md:text-2xl font-medium mb-4",
            textColor,
            "opacity-90"
          )}>
            {subtitle}
          </p>
        )}
        
        {description && (
          <p className={cn(
            "text-base md:text-lg mb-6 max-w-3xl",
            textColor,
            "opacity-80",
            text_alignment === 'center' && "mx-auto"
          )}>
            {description}
          </p>
        )}
        
        {urgency_text && (
          <p className={cn(
            "text-sm font-semibold mb-4 px-4 py-2 rounded-lg",
            background_type === 'gradient' || background_image
              ? "bg-red-500/20 text-red-100"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          )}>
            🔥 {urgency_text}
          </p>
        )}
      </>
    );

    switch (layout) {
      case 'split':
        return (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className={cn("space-y-6", alignmentClasses[text_alignment])}>
              {contentElements}
              {renderButtons()}
              {renderSocialProof()}
            </div>
            <div className="hidden md:block">
              {renderFeatures()}
            </div>
          </div>
        );

      case 'card':
        return (
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              <div className={cn("space-y-6", alignmentClasses[text_alignment])}>
                {contentElements}
                {renderButtons()}
                {renderFeatures()}
                {renderSocialProof()}
              </div>
            </CardContent>
          </Card>
        );

      case 'banner':
        return (
          <div className={cn(
            "flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8"
          )}>
            <div className={cn("flex-grow", alignmentClasses[text_alignment])}>
              {contentElements}
              {renderSocialProof()}
            </div>
            <div className="flex-shrink-0">
              {renderButtons()}
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className={cn("max-w-2xl mx-auto space-y-4", alignmentClasses[text_alignment])}>
            {title && (
              <h2 className={cn("text-2xl md:text-3xl font-bold", textColor)}>
                {title}
              </h2>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {renderButtons()}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-8">
            <div className={cn("max-w-3xl mx-auto space-y-6", alignmentClasses[text_alignment])}>
              {contentElements}
              {renderButtons()}
            </div>
            {renderFeatures()}
            {renderSocialProof()}
          </div>
        );

      case 'centered':
      default:
        return (
          <div className={cn("max-w-4xl mx-auto space-y-6", alignmentClasses[text_alignment])}>
            {contentElements}
            {renderButtons()}
            {renderFeatures()}
            {renderSocialProof()}
          </div>
        );
    }
  };

  return (
    <section 
      className={cn(
        "wp-block-acf-cta-section relative overflow-hidden",
        sizeClasses[size],
        background_type !== 'none' && "text-white",
        border_radius && "rounded-xl mx-4",
        className
      )}
      style={getBackgroundStyles()}
      data-block-name={block.name}
      data-layout={layout}
    >
      {/* Background Image */}
      {background_type === 'image' && background_image?.url && (
        <div className="absolute inset-0 z-0">
          <Image
            src={background_image.url}
            alt={background_image.alt || ''}
            fill
            className="object-cover"
            priority={!isNested}
            sizes="100vw"
          />
          
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: overlay_opacity / 100 }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {renderContent()}
      </div>

      {/* Development Placeholder */}
      {process.env.NODE_ENV === 'development' && !title && !subtitle && (
        <div className="absolute inset-0 z-20 bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">CTA Section Block</h3>
            <p>Configure call-to-action content in WordPress</p>
            <p className="text-sm mt-2">Layout: {layout}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default ACFCTASection;