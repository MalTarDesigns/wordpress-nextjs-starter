import type { Metadata } from 'next';
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Content Blocks Demo - WordPress Next.js Starter',
  description: 'Showcase of production-ready WordPress content blocks built with Next.js, TypeScript, and shadcn/ui',
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Simple demo navigation */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}