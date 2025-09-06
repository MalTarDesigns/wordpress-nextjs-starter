import type { Metadata, Viewport } from 'next';
import { draftMode } from "next/headers";
import { Inter } from "next/font/google";

import "@/app/globals.css";

import Navigation from "@/components/Globals/Navigation/Navigation";
import { PreviewNotice } from "@/components/Globals/PreviewNotice/PreviewNotice";
import { ThemeProvider } from "@/components/theme-provider";
import { PreviewProvider } from "@/hooks/usePreview";
import { generateWebsiteStructuredData } from '@/utils/seoData';

// Optimized font loading with display swap
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

// Enhanced metadata for the root layout
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'),
  title: {
    template: '%s | ' + (process.env.NEXT_PUBLIC_SITE_NAME || 'WordPress Site'),
    default: process.env.NEXT_PUBLIC_SITE_NAME || 'WordPress Site',
  },
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern WordPress site built with Next.js',
  generator: 'Next.js',
  applicationName: process.env.NEXT_PUBLIC_SITE_NAME || 'WordPress Site',
  referrer: 'origin-when-cross-origin',
  keywords: ['WordPress', 'Next.js', 'React', 'TypeScript', 'Headless CMS'],
  authors: [{ name: 'WordPress Team' }],
  creator: 'WordPress Team',
  publisher: process.env.NEXT_PUBLIC_SITE_NAME || 'WordPress Site',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: process.env.NEXT_PUBLIC_LOCALE || 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'WordPress Site',
    title: process.env.NEXT_PUBLIC_SITE_NAME || 'WordPress Site',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern WordPress site built with Next.js',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Default social media image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: process.env.NEXT_PUBLIC_SITE_NAME || 'WordPress Site',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern WordPress site built with Next.js',
    images: ['/images/og-default.jpg'],
    creator: process.env.NEXT_PUBLIC_TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

// Enhanced viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
};

// Root layout with enhanced accessibility and performance
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled } = await draftMode();

  // Generate structured data for the website
  const structuredData = generateWebsiteStructuredData();

  return (
    <html 
      lang={process.env.NEXT_PUBLIC_LOCALE?.split('_')[0] || 'en'}
      suppressHydrationWarning
    >
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {/* Preconnect to WordPress API */}
        {process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME && (
          <link
            rel="preconnect"
            href={`https://${process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME}`}
          />
        )}
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PreviewProvider>
            {/* Skip to main content for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50 transition-all"
            >
              Skip to main content
            </a>
            
            {/* Enhanced preview notice with context */}
            {isEnabled && <PreviewNotice />}
            
            {/* Main navigation */}
            <Navigation />
            
            {/* Main content area */}
            <main id="main-content" role="main">
              {children}
            </main>
            
            {/* Performance monitoring in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded opacity-50 pointer-events-none">
                Development Mode
              </div>
            )}
          </PreviewProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
