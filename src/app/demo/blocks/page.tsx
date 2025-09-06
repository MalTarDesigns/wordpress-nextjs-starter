'use client';

import React from 'react';
import { ACFHeroSection } from '@/components/BlockRenderer/blocks/acf/HeroSection';
import { ACFImageGallery } from '@/components/BlockRenderer/blocks/acf/ImageGallery';
import { ACFTestimonialSection } from '@/components/BlockRenderer/blocks/acf/TestimonialSection';
import { ACFFAQSection } from '@/components/BlockRenderer/blocks/acf/FAQSection';
import { ACFCTASection } from '@/components/BlockRenderer/blocks/acf/CTASection';

export default function BlocksDemo() {
  // Demo block mock
  const mockBlock = { name: 'demo-block' };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Content Blocks Demo</h1>
              <p className="text-muted-foreground">
                Showcase of production-ready WordPress content blocks
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Built with Next.js + shadcn/ui
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-6 text-sm">
            <a href="#hero" className="hover:text-primary transition-colors">
              Hero Section
            </a>
            <a href="#gallery" className="hover:text-primary transition-colors">
              Image Gallery
            </a>
            <a href="#testimonials" className="hover:text-primary transition-colors">
              Testimonials
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              FAQ
            </a>
            <a href="#cta" className="hover:text-primary transition-colors">
              Call to Action
            </a>
          </div>
        </div>
      </nav>

      {/* Demo Content */}
      <main>
        {/* Hero Section Demo */}
        <section id="hero" className="border-b border-border/50">
          <ACFHeroSection
            block={mockBlock}
            attributes={{
              title: 'Beautiful Content Blocks for WordPress',
              subtitle: 'Built with Next.js, TypeScript & shadcn/ui',
              description: 'Create stunning websites with these production-ready content blocks that support dark mode, responsive design, and accessibility features.',
              layout: 'centered',
              height: 'large',
              text_alignment: 'center',
              background_type: 'gradient',
              badge_text: 'New Release',
              cta_buttons: [
                {
                  title: 'Get Started',
                  url: '#gallery',
                  style: 'default',
                },
                {
                  title: 'Learn More',
                  url: '#features',
                  style: 'outline',
                }
              ],
              features: [
                { icon: '⚡', text: 'Lightning Fast' },
                { icon: '🎨', text: 'Beautiful Design' },
                { icon: '♿', text: 'Accessible' },
                { icon: '📱', text: 'Responsive' }
              ]
            }}
          />
        </section>

        {/* Image Gallery Demo */}
        <section id="gallery" className="border-b border-border/50">
          <ACFImageGallery
            block={mockBlock}
            attributes={{
              title: 'Image Gallery Showcase',
              description: 'Multiple layout options with lightbox functionality',
              layout: 'grid',
              columns: 3,
              columns_tablet: 2,
              columns_mobile: 1,
              gap: 'medium',
              enable_lightbox: true,
              show_captions: true,
              caption_position: 'overlay',
              hover_effect: 'zoom',
              rounded_corners: true,
              images: [
                {
                  id: 1,
                  url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=faces',
                  alt: 'Modern office workspace',
                  title: 'Modern Workspace',
                  caption: 'A beautiful modern office setup'
                },
                {
                  id: 2,
                  url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop&crop=faces',
                  alt: 'Team collaboration',
                  title: 'Team Collaboration',
                  caption: 'Working together towards success'
                },
                {
                  id: 3,
                  url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop&crop=faces',
                  alt: 'Creative design process',
                  title: 'Creative Process',
                  caption: 'Innovation through design thinking'
                },
                {
                  id: 4,
                  url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop&crop=faces',
                  alt: 'Technology innovation',
                  title: 'Tech Innovation',
                  caption: 'Cutting-edge technology solutions'
                },
                {
                  id: 5,
                  url: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=600&fit=crop&crop=faces',
                  alt: 'Business growth',
                  title: 'Business Growth',
                  caption: 'Scaling your business effectively'
                },
                {
                  id: 6,
                  url: 'https://images.unsplash.com/photo-1556155092-8707de31f9c4?w=800&h=600&fit=crop&crop=faces',
                  alt: 'Digital transformation',
                  title: 'Digital Transformation',
                  caption: 'Embracing the digital future'
                }
              ]
            }}
          />
        </section>

        {/* Testimonial Section Demo */}
        <section id="testimonials" className="border-b border-border/50">
          <ACFTestimonialSection
            block={mockBlock}
            attributes={{
              title: 'What Our Clients Say',
              subtitle: 'Trusted by thousands of businesses worldwide',
              layout: 'grid',
              columns: 3,
              card_style: 'elevated',
              show_rating: true,
              background_pattern: true,
              testimonials: [
                {
                  quote: 'These content blocks have completely transformed how we build websites. The quality and attention to detail is outstanding.',
                  author_name: 'Sarah Johnson',
                  author_title: 'CTO',
                  author_company: 'TechCorp Inc.',
                  author_image: {
                    url: 'https://images.unsplash.com/photo-1494790108755-2616b612b787?w=150&h=150&fit=crop&crop=faces',
                    alt: 'Sarah Johnson'
                  },
                  rating: 5,
                  featured: true,
                  tags: ['Performance', 'Design']
                },
                {
                  quote: 'Incredible performance and beautiful design. Our clients love the new website experience.',
                  author_name: 'Michael Chen',
                  author_title: 'Creative Director',
                  author_company: 'Design Studio',
                  author_image: {
                    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces',
                    alt: 'Michael Chen'
                  },
                  rating: 5,
                  tags: ['User Experience']
                },
                {
                  quote: 'The accessibility features are top-notch. Finally, blocks that work for everyone.',
                  author_name: 'Emily Rodriguez',
                  author_title: 'Accessibility Specialist',
                  author_company: 'Inclusive Web',
                  author_image: {
                    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces',
                    alt: 'Emily Rodriguez'
                  },
                  rating: 5,
                  tags: ['Accessibility', 'Inclusive Design']
                }
              ]
            }}
          />
        </section>

        {/* FAQ Section Demo */}
        <section id="faq" className="border-b border-border/50">
          <ACFFAQSection
            block={mockBlock}
            attributes={{
              title: 'Frequently Asked Questions',
              subtitle: 'Everything you need to know about our content blocks',
              layout: 'accordion',
              style: 'default',
              allow_multiple_open: true,
              show_search: true,
              show_categories: true,
              faqs: [
                {
                  id: 'getting-started',
                  question: 'How do I get started with these content blocks?',
                  answer: 'Simply install the blocks in your WordPress site and start building beautiful pages. Each block comes with extensive customization options and documentation.',
                  category: 'Getting Started',
                  featured: true,
                  tags: ['Installation', 'Setup']
                },
                {
                  id: 'customization',
                  question: 'Can I customize the design and colors?',
                  answer: 'Absolutely! All blocks support the shadcn/ui design system with custom CSS properties. You can easily customize colors, spacing, typography, and more through your theme settings.',
                  category: 'Customization',
                  tags: ['Design', 'Theming']
                },
                {
                  id: 'responsive',
                  question: 'Are the blocks mobile-friendly?',
                  answer: 'Yes, all blocks are built with a mobile-first approach and are fully responsive. They automatically adapt to different screen sizes and devices.',
                  category: 'Features',
                  tags: ['Mobile', 'Responsive']
                },
                {
                  id: 'accessibility',
                  question: 'What accessibility features are included?',
                  answer: 'All blocks follow WCAG 2.1 AA guidelines with proper semantic HTML, keyboard navigation, screen reader support, and color contrast compliance.',
                  category: 'Features',
                  tags: ['Accessibility', 'WCAG']
                },
                {
                  id: 'performance',
                  question: 'How do these blocks affect site performance?',
                  answer: 'The blocks are optimized for performance with lazy loading, code splitting, optimized images, and minimal JavaScript. They follow web performance best practices.',
                  category: 'Technical',
                  tags: ['Performance', 'Optimization']
                }
              ]
            }}
          />
        </section>

        {/* CTA Section Demo */}
        <section id="cta">
          <ACFCTASection
            block={mockBlock}
            attributes={{
              title: 'Ready to Build Amazing Websites?',
              subtitle: 'Join thousands of developers using these blocks',
              description: 'Start creating beautiful, accessible, and high-performance websites today with our comprehensive content block library.',
              layout: 'features',
              background_type: 'gradient',
              size: 'large',
              text_alignment: 'center',
              badge_text: 'Limited Time',
              urgency_text: 'Special launch pricing - ends soon!',
              show_social_proof: true,
              testimonial_text: 'The best content blocks I\'ve ever used. Highly recommended!',
              testimonial_author: 'Alex Thompson, Lead Developer',
              buttons: [
                {
                  title: 'Start Building Now',
                  url: '#',
                  style: 'default',
                  icon: 'arrow'
                },
                {
                  title: 'View Documentation',
                  url: '#',
                  style: 'outline',
                  icon: 'none'
                }
              ],
              features: [
                {
                  icon: '🚀',
                  title: 'Production Ready',
                  description: 'Enterprise-grade components'
                },
                {
                  icon: '🎨',
                  title: 'Beautiful Design',
                  description: 'Modern, clean aesthetics'
                },
                {
                  icon: '♿',
                  title: 'Fully Accessible',
                  description: 'WCAG 2.1 AA compliant'
                },
                {
                  icon: '📱',
                  title: 'Mobile First',
                  description: 'Responsive on all devices'
                },
                {
                  icon: '⚡',
                  title: 'Lightning Fast',
                  description: 'Optimized for performance'
                },
                {
                  icon: '🌙',
                  title: 'Dark Mode',
                  description: 'Built-in theme support'
                }
              ]
            }}
          />
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