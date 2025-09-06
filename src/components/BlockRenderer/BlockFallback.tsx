'use client';

import React from 'react';
import type { Block } from '@/types/blocks';

interface BlockFallbackProps {
  error?: Error;
  blockName?: string;
  block?: Block;
  errorInfo?: React.ErrorInfo;
}

/**
 * Default fallback component for when block rendering fails
 */
export function BlockFallback({ 
  error, 
  blockName, 
  block,
  errorInfo 
}: BlockFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // In production, show minimal fallback
  if (!isDevelopment) {
    return (
      <div 
        className="block-error-fallback bg-gray-50 border border-gray-200 rounded p-4 my-4"
        role="alert"
        aria-label="Block content unavailable"
      >
        <p className="text-gray-600 text-sm">
          Content temporarily unavailable
        </p>
      </div>
    );
  }

  // In development, show detailed error information
  return (
    <div 
      className="block-error-fallback bg-red-50 border-2 border-red-200 rounded-lg p-4 my-4"
      role="alert"
      aria-label="Block rendering error"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-red-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Block Rendering Error
          </h3>
          
          <div className="mt-2 text-sm text-red-700">
            <p>
              <strong>Block:</strong> {blockName || 'Unknown'}
            </p>
            
            {error && (
              <p className="mt-1">
                <strong>Error:</strong> {error.message}
              </p>
            )}
            
            {block && (
              <details className="mt-2">
                <summary className="cursor-pointer hover:text-red-900">
                  Block Data
                </summary>
                <pre className="mt-1 bg-red-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(block, null, 2)}
                </pre>
              </details>
            )}
            
            {error?.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer hover:text-red-900">
                  Error Stack
                </summary>
                <pre className="mt-1 bg-red-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {error.stack}
                </pre>
              </details>
            )}
            
            {errorInfo?.componentStack && (
              <details className="mt-2">
                <summary className="cursor-pointer hover:text-red-900">
                  Component Stack
                </summary>
                <pre className="mt-1 bg-red-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal fallback for missing block components
 */
export function MissingBlockFallback({ 
  blockName, 
  block 
}: { 
  blockName: string; 
  block?: Block; 
}) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment) {
    // In production, try to render as HTML if available
    const innerHTML = block && 'innerHTML' in block ? block.innerHTML : '';
    
    if (innerHTML) {
      return (
        <div 
          className="block-missing-fallback"
          dangerouslySetInnerHTML={{ __html: innerHTML }}
        />
      );
    }
    
    // Return null to hide missing blocks in production
    return null;
  }

  return (
    <div 
      className="block-missing-fallback bg-yellow-50 border-2 border-yellow-200 border-dashed rounded-lg p-4 my-4"
      role="alert"
      aria-label="Missing block component"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-yellow-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Missing Block Component
          </h3>
          
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              No component registered for block: <code className="bg-yellow-100 px-1 rounded">{blockName}</code>
            </p>
            
            <p className="mt-1">
              Register this block using <code className="bg-yellow-100 px-1 rounded">BlockRegistry.registerBlock()</code>
            </p>
            
            {block && (
              <details className="mt-2">
                <summary className="cursor-pointer hover:text-yellow-900">
                  Block Data
                </summary>
                <pre className="mt-1 bg-yellow-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(block, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading fallback for async block components
 */
export function BlockLoadingFallback({ 
  blockName 
}: { 
  blockName?: string 
}) {
  return (
    <div 
      className="block-loading-fallback bg-gray-50 border border-gray-200 rounded-lg p-4 my-4 animate-pulse"
      role="status"
      aria-label={`Loading ${blockName || 'block'}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="h-5 w-5 bg-gray-300 rounded"></div>
        </div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Unsupported block fallback
 */
export function UnsupportedBlockFallback({ 
  blockName, 
  block 
}: { 
  blockName: string; 
  block?: Block; 
}) {
  const innerHTML = block && 'innerHTML' in block ? block.innerHTML : '';
  
  // Try to render as HTML if available
  if (innerHTML) {
    return (
      <div 
        className="block-unsupported-fallback"
        dangerouslySetInnerHTML={{ __html: innerHTML }}
        data-block-name={blockName}
      />
    );
  }

  // Show placeholder in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div 
        className="block-unsupported-fallback bg-gray-100 border border-gray-300 rounded p-3 my-2 text-sm text-gray-600"
        data-block-name={blockName}
      >
        Unsupported block: {blockName}
      </div>
    );
  }

  // Hide in production
  return null;
}

export default BlockFallback;