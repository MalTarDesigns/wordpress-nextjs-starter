'use client';

import React, { useState } from 'react';

export default function StandaloneDemo() {
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
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 40
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
            Content Blocks Demo
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Production-ready WordPress content blocks built with Next.js & shadcn/ui
          </p>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section style={{ 
          padding: '5rem 1rem',
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              backgroundColor: '#ddd6fe',
              color: '#7c3aed',
              border: '1px solid #c4b5fd',
              marginBottom: '1.5rem'
            }}>
              New Release
            </span>
            
            <h1 style={{ 
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 'bold',
              lineHeight: '1.1',
              margin: '0 0 1.5rem 0'
            }}>
              Beautiful Content Blocks for WordPress
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem',
              color: '#6b7280',
              margin: '0 0 1.5rem 0'
            }}>
              Built with Next.js, TypeScript & shadcn/ui
            </p>
            
            <p style={{ 
              fontSize: '1.125rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              lineHeight: '1.6'
            }}>
              Create stunning websites with production-ready content blocks that support 
              dark mode, responsive design, and accessibility features.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#111827',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Get Started
                <span>→</span>
              </button>
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#111827',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Learn More
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2rem', 
              marginTop: '2rem',
              fontSize: '0.875rem',
              color: '#6b7280',
              flexWrap: 'wrap'
            }}>
              <span>⚡ Lightning Fast</span>
              <span>🎨 Beautiful Design</span>
              <span>♿ Accessible</span>
              <span>📱 Responsive</span>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <section style={{ padding: '4rem 1rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                margin: '0 0 1rem 0'
              }}>
                Image Gallery Showcase
              </h2>
              <p style={{ fontSize: '1.125rem', color: '#6b7280', margin: 0 }}>
                Multiple layout options with lightbox functionality
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {images.map((image, index) => (
                <div
                  key={image.id}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '0.5rem',
                    backgroundColor: '#f3f4f6',
                    cursor: 'pointer',
                    aspectRatio: '1',
                    transition: 'transform 0.3s ease'
                  }}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setLightboxOpen(true);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                  
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)'
                  }}>
                    <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>
                      {image.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Simple Lightbox */}
            {lightboxOpen && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.95)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => setLightboxOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1.5rem'
                  }}
                >
                  ×
                </button>

                <img
                  src={images[currentImageIndex]?.url || ''}
                  alt={images[currentImageIndex]?.alt || ''}
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain'
                  }}
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? images.length - 1 : prev - 1
                      )}
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '1.5rem'
                      }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        (prev + 1) % images.length
                      )}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        fontSize: '1.5rem'
                      }}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ padding: '4rem 1rem', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                margin: '0 0 1rem 0'
              }}>
                What Our Clients Say
              </h2>
              <p style={{ fontSize: '1.125rem', color: '#6b7280', margin: 0 }}>
                Trusted by thousands of businesses worldwide
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'box-shadow 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        style={{
                          color: i < testimonial.rating ? '#f59e0b' : '#d1d5db',
                          fontSize: '1.25rem'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  
                  <blockquote style={{ marginBottom: '1.5rem' }}>
                    <p style={{ 
                      color: '#6b7280', 
                      lineHeight: '1.6', 
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      "{testimonial.quote}"
                    </p>
                  </blockquote>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    paddingTop: '1rem', 
                    borderTop: '1px solid #e5e7eb' 
                  }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '50%',
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {testimonial.author_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {testimonial.author_name}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {testimonial.author_title}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section - Simple Accordion */}
        <section style={{ padding: '4rem 1rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ 
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: 'bold',
                margin: '0 0 1rem 0'
              }}>
                Frequently Asked Questions
              </h2>
              <p style={{ fontSize: '1.125rem', color: '#6b7280', margin: 0 }}>
                Everything you need to know about our content blocks
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <summary style={{
                    fontWeight: '600',
                    fontSize: '1.125rem',
                    marginBottom: '0.5rem',
                    listStyle: 'none',
                    cursor: 'pointer'
                  }}>
                    {faq.question}
                  </summary>
                  <p style={{
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: '1rem 0 0 0'
                  }}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ 
          padding: '5rem 1rem',
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem'
            }}>
              Limited Time
            </span>
            
            <h2 style={{ 
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 'bold',
              margin: '0 0 1.5rem 0'
            }}>
              Ready to Build Amazing Websites?
            </h2>
            
            <p style={{ 
              fontSize: '1.25rem',
              opacity: 0.9,
              margin: '0 0 1.5rem 0'
            }}>
              Join thousands of developers using these blocks
            </p>
            
            <p style={{ 
              fontSize: '1.125rem',
              opacity: 0.8,
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              lineHeight: '1.6'
            }}>
              Start creating beautiful, accessible, and high-performance websites today 
              with our comprehensive content block library.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: '#111827',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Start Building Now
                <span>→</span>
              </button>
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                View Documentation
              </button>
            </div>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginTop: '3rem',
              textAlign: 'left'
            }}>
              {[
                { icon: '🚀', title: 'Production Ready', desc: 'Enterprise-grade components' },
                { icon: '🎨', title: 'Beautiful Design', desc: 'Modern, clean aesthetics' },
                { icon: '♿', title: 'Fully Accessible', desc: 'WCAG 2.1 AA compliant' },
                { icon: '📱', title: 'Mobile First', desc: 'Responsive on all devices' },
                { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized for performance' },
                { icon: '🌙', title: 'Dark Mode', desc: 'Built-in theme support' }
              ].map((feature, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600' }}>{feature.title}</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        padding: '3rem 1rem'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
            Ready to use these blocks in your project?
          </h3>
          <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0', lineHeight: '1.6' }}>
            All blocks are fully documented with TypeScript interfaces, 
            accessibility features, and responsive design patterns.
          </p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1rem',
            flexWrap: 'wrap',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                width: '0.5rem', 
                height: '0.5rem', 
                backgroundColor: '#10b981', 
                borderRadius: '50%' 
              }}></span>
              Production Ready
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                width: '0.5rem', 
                height: '0.5rem', 
                backgroundColor: '#3b82f6', 
                borderRadius: '50%' 
              }}></span>
              TypeScript
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                width: '0.5rem', 
                height: '0.5rem', 
                backgroundColor: '#8b5cf6', 
                borderRadius: '50%' 
              }}></span>
              Accessible
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                width: '0.5rem', 
                height: '0.5rem', 
                backgroundColor: '#f59e0b', 
                borderRadius: '50%' 
              }}></span>
              Dark Mode
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}