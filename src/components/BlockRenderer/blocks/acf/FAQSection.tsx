'use client';

import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { HelpCircle, Search, Filter, Plus, Minus } from 'lucide-react';
import type { BlockComponentProps } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  featured?: boolean;
  helpful_count?: number;
  tags?: string[];
}

interface FAQSectionBlock {
  acf_fc_layout: string;
  name: string;
  faqs?: FAQItem[];
  title?: string;
  subtitle?: string;
  layout?: 'accordion' | 'cards' | 'two-column';
  style?: 'default' | 'bordered' | 'minimal' | 'gradient';
  allow_multiple_open?: boolean;
  show_search?: boolean;
  show_categories?: boolean;
  categories?: string[];
  background_pattern?: boolean;
  icon_style?: 'plus-minus' | 'chevron' | 'none';
  default_expanded?: string[]; // FAQ IDs to expand by default
}

interface FAQSectionProps extends BlockComponentProps<FAQSectionBlock> {}

export function ACFFAQSection({ 
  block, 
  attributes, 
  className,
  isNested = false 
}: FAQSectionProps) {
  const {
    faqs = [],
    title = '',
    subtitle = '',
    layout = 'accordion',
    style = 'default',
    allow_multiple_open = false,
    show_search = false,
    show_categories = false,
    categories = [],
    background_pattern = false,
    icon_style = 'chevron',
    default_expanded = []
  } = attributes;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>(default_expanded);

  // Get unique categories from FAQs
  const availableCategories = React.useMemo(() => {
    const cats = new Set(faqs.map((faq: FAQItem) => faq.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [faqs]);

  // Filter FAQs based on search and category
  const filteredFAQs = React.useMemo(() => {
    let filtered = faqs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((faq: FAQItem) => 
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        (faq.tags && faq.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((faq: FAQItem) => faq.category === selectedCategory);
    }

    return filtered;
  }, [faqs, searchTerm, selectedCategory]);

  // Style classes for different FAQ layouts
  const getContainerClasses = () => {
    switch (style) {
      case 'bordered':
        return 'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden';
      case 'minimal':
        return 'space-y-1';
      case 'gradient':
        return 'bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-xl p-6';
      default:
        return 'space-y-4';
    }
  };

  const getItemClasses = (index: number) => {
    switch (style) {
      case 'bordered':
        return cn(
          "border-b border-gray-200 dark:border-gray-700 last:border-b-0",
          "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        );
      case 'minimal':
        return "py-2";
      case 'gradient':
        return "bg-white/50 dark:bg-gray-900/50 rounded-lg mb-3 shadow-sm";
      default:
        return "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow";
    }
  };

  // Custom toggle for card layout
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      
      if (allow_multiple_open) {
        return [...prev, id];
      } else {
        return [id];
      }
    });
  };

  // Render FAQ items based on layout
  const renderFAQs = () => {
    if (filteredFAQs.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{searchTerm || selectedCategory ? 'No FAQs match your criteria' : 'No FAQs available'}</p>
        </div>
      );
    }

    switch (layout) {
      case 'cards':
        return (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            {filteredFAQs.map((faq: FAQItem, index: number) => {
              const isExpanded = expandedItems.includes(faq.id || index.toString());
              
              return (
                <Card 
                  key={faq.id || index}
                  className={cn(
                    "transition-all duration-300 hover:shadow-lg",
                    faq.featured && "ring-2 ring-primary/20"
                  )}
                >
                  <div className="p-6">
                    {/* Question */}
                    <button
                      className="w-full flex items-center justify-between text-left group"
                      onClick={() => toggleExpanded(faq.id || index.toString())}
                      aria-expanded={isExpanded}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors pr-4">
                        {faq.question}
                      </h3>
                      {icon_style === 'plus-minus' ? (
                        isExpanded ? (
                          <Minus className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary flex-shrink-0 transition-colors" />
                        )
                      ) : (
                        <div className={cn(
                          "w-5 h-5 border-l-2 border-b-2 border-gray-400 group-hover:border-primary transition-all duration-200 flex-shrink-0",
                          isExpanded ? "rotate-45 translate-y-[-2px]" : "-rotate-45"
                        )} />
                      )}
                    </button>
                    
                    {/* Category & Tags */}
                    {(faq.category || (faq.tags && faq.tags.length > 0)) && (
                      <div className="flex flex-wrap gap-2 mt-3 mb-4">
                        {faq.category && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            {faq.category}
                          </span>
                        )}
                        {faq.tags?.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Answer */}
                    <div className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div 
                          className="text-gray-600 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                        
                        {/* Helpful counter */}
                        {typeof faq.helpful_count === 'number' && faq.helpful_count > 0 && (
                          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                            {faq.helpful_count} people found this helpful
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        );

      case 'two-column':
        const midpoint = Math.ceil(filteredFAQs.length / 2);
        const leftColumn = filteredFAQs.slice(0, midpoint);
        const rightColumn = filteredFAQs.slice(midpoint);
        
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className={getContainerClasses()}>
              <Accordion 
                type={allow_multiple_open ? "multiple" : "single"} 
                className="w-full"
                defaultValue={default_expanded}
              >
                {leftColumn.map((faq: FAQItem, index: number) => (
                  <AccordionItem 
                    key={faq.id || `left-${index}`}
                    value={faq.id || `left-${index}`}
                    className={getItemClasses(index)}
                  >
                    <AccordionTrigger className="px-6 py-4 text-left [&[data-state=open]>div>span]:text-primary">
                      <div className="flex items-center gap-3 w-full">
                        {faq.category && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full flex-shrink-0">
                            {faq.category}
                          </span>
                        )}
                        <span className="font-semibold">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div 
                        className="text-gray-600 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className={getContainerClasses()}>
              <Accordion 
                type={allow_multiple_open ? "multiple" : "single"} 
                className="w-full"
                defaultValue={default_expanded}
              >
                {rightColumn.map((faq: FAQItem, index: number) => (
                  <AccordionItem 
                    key={faq.id || `right-${index}`}
                    value={faq.id || `right-${index}`}
                    className={getItemClasses(index + midpoint)}
                  >
                    <AccordionTrigger className="px-6 py-4 text-left [&[data-state=open]>div>span]:text-primary">
                      <div className="flex items-center gap-3 w-full">
                        {faq.category && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full flex-shrink-0">
                            {faq.category}
                          </span>
                        )}
                        <span className="font-semibold">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div 
                        className="text-gray-600 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        );

      case 'accordion':
      default:
        return (
          <div className={getContainerClasses()}>
            <Accordion 
              type={allow_multiple_open ? "multiple" : "single"} 
              className="w-full"
              defaultValue={default_expanded}
            >
              {filteredFAQs.map((faq: FAQItem, index: number) => (
                <AccordionItem 
                  key={faq.id || index}
                  value={faq.id || index.toString()}
                  className={cn(
                    getItemClasses(index),
                    faq.featured && "ring-2 ring-primary/20"
                  )}
                >
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline [&[data-state=open]>div>span]:text-primary group">
                    <div className="flex items-center gap-3 w-full">
                      {faq.category && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full flex-shrink-0">
                          {faq.category}
                        </span>
                      )}
                      <span className="font-semibold group-hover:text-primary transition-colors">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div 
                      className="text-gray-600 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                    
                    {/* Tags */}
                    {faq.tags && faq.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        {faq.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Helpful counter */}
                    {typeof faq.helpful_count === 'number' && faq.helpful_count > 0 && (
                      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        {faq.helpful_count} people found this helpful
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );
    }
  };

  return (
    <section 
      className={cn(
        "wp-block-acf-faq-section py-12 lg:py-20",
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='m0 40 40-40H0v40zm40 0V0h-40v40h40z'/%3E%3C/g%3E%3C/svg%3E")`,
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

        {/* Search and Filters */}
        {(show_search || show_categories) && (
          <div className="mb-8 space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
            {/* Search */}
            {show_search && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}
            
            {/* Category Filter */}
            {show_categories && availableCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-full transition-colors",
                    !selectedCategory 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  All
                </button>
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-3 py-1 text-sm font-medium rounded-full transition-colors",
                      selectedCategory === category 
                        ? "bg-primary text-white" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQ Content */}
        {renderFAQs()}
      </div>

      {/* Development Placeholder */}
      {process.env.NODE_ENV === 'development' && faqs.length === 0 && (
        <div className="container mx-auto px-4">
          <div className="bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <HelpCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">FAQ Section Block</h3>
              <p>Add frequently asked questions in WordPress editor</p>
              <p className="text-sm mt-2">Layout: {layout}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ACFFAQSection;