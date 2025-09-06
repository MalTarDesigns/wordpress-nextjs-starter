'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn,
  HelpCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SimpleBlocksDemo() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sample data
  const images = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
      alt: 'Modern workspace',
      caption: 'A beautiful modern office setup'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop',
      alt: 'Team collaboration',
      caption: 'Working together towards success'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
      alt: 'Creative design',
      caption: 'Innovation through design thinking'
    }
  ];

  const testimonials = [
    {
      quote: 'These content blocks have completely transformed how we build websites.',
      author_name: 'Sarah Johnson',
      author_title: 'CTO, TechCorp Inc.',
      rating: 5
    },
    {
      quote: 'Incredible performance and beautiful design. Our clients love it.',
      author_name: 'Michael Chen', 
      author_title: 'Creative Director',
      rating: 5
    },
    {
      quote: 'The accessibility features are top-notch. Highly recommended.',
      author_name: 'Emily Rodriguez',
      author_title: 'Accessibility Specialist',
      rating: 5
    }
  ];

  const faqs = [
    {
      question: 'How do I get started with these content blocks?',
      answer: 'Simply install the blocks and start building beautiful pages with extensive customization options.'
    },
    {
      question: 'Can I customize the design and colors?',
      answer: 'Yes! All blocks support the shadcn/ui design system with custom CSS properties.'
    },
    {
      question: 'Are the blocks mobile-friendly?',
      answer: 'Absolutely! All blocks are built with a mobile-first responsive approach.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Content Blocks Demo</h1>
          <p className="text-muted-foreground">Production-ready WordPress content blocks</p>
        </div>
      </header>

      <main className="space-y-16">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-6">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-bold bg-primary/20 text-primary border border-primary/30">
                New Release
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Beautiful Content Blocks for WordPress
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground">
                Built with Next.js, TypeScript & shadcn/ui
              </p>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create stunning websites with production-ready content blocks that support 
                dark mode, responsive design, and accessibility features.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-6">
                <Button size="lg" className="font-semibold">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>

              <div className="flex justify-center gap-8 pt-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">⚡ Lightning Fast</span>
                <span className="flex items-center gap-2">🎨 Beautiful Design</span>
                <span className="flex items-center gap-2">♿ Accessible</span>
                <span className="flex items-center gap-2">📱 Responsive</span>
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Image Gallery Showcase</h2>
              <p className="text-lg text-muted-foreground">
                Multiple layout options with lightbox functionality
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer transition-transform hover:scale-105"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white text-sm font-medium">{image.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
                <div className="relative w-full h-[80vh]">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                    onClick={() => setLightboxOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>

                  <div className="absolute top-4 left-4 z-50 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>

                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={images[currentImageIndex]?.url || ''}
                      alt={images[currentImageIndex]?.alt || ''}
                      fill
                      className="object-contain"
                      sizes="95vw"
                    />
                  </div>

                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? images.length - 1 : prev - 1
                        )}
                      >
                        <ChevronLeft className="h-8 w-8" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                        onClick={() => setCurrentImageIndex(prev => 
                          (prev + 1) % images.length
                        )}
                      >
                        <ChevronRight className="h-8 w-8" />
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-lg text-muted-foreground">
                Trusted by thousands of businesses worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    
                    <blockquote className="mb-6">
                      <p className="text-muted-foreground leading-relaxed">
                        "{testimonial.quote}"
                      </p>
                    </blockquote>
                    
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {testimonial.author_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.author_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.author_title}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about our content blocks
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-white dark:bg-gray-900 border rounded-lg px-6 shadow-sm"
                  >
                    <AccordionTrigger className="py-4 hover:no-underline">
                      <span className="font-semibold text-left">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-6">
              <span className="inline-block px-4 py-2 rounded-lg bg-white/20 text-sm font-bold">
                Limited Time
              </span>
              
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Build Amazing Websites?
              </h2>
              
              <p className="text-xl opacity-90">
                Join thousands of developers using these blocks
              </p>
              
              <p className="text-lg opacity-80 max-w-2xl mx-auto">
                Start creating beautiful, accessible, and high-performance websites today 
                with our comprehensive content block library.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-6">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Start Building Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Documentation
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-12 text-left">
                {[
                  { icon: '🚀', title: 'Production Ready', desc: 'Enterprise-grade components' },
                  { icon: '🎨', title: 'Beautiful Design', desc: 'Modern, clean aesthetics' },
                  { icon: '♿', title: 'Fully Accessible', desc: 'WCAG 2.1 AA compliant' },
                  { icon: '📱', title: 'Mobile First', desc: 'Responsive on all devices' },
                  { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized for performance' },
                  { icon: '🌙', title: 'Dark Mode', desc: 'Built-in theme support' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <div className="font-semibold">{feature.title}</div>
                      <div className="text-sm opacity-80">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-lg font-semibold">
              Ready to use these blocks in your project?
            </h3>
            <p className="text-muted-foreground">
              All blocks are fully documented with TypeScript interfaces, 
              accessibility features, and responsive design patterns.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Production Ready
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                TypeScript
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Accessible
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Dark Mode
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}