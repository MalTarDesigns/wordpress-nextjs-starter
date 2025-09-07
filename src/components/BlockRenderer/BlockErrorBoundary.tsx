'use client';

import React, { Component, type ReactNode } from 'react';
import type { BlockErrorBoundaryProps, Block } from '@/types/blocks';
import { BlockFallback } from './BlockFallback';

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error boundary component for catching and handling block rendering errors
 */
export class BlockErrorBoundary extends Component<
  BlockErrorBoundaryProps & { block?: Block },
  State
> {
  constructor(props: BlockErrorBoundaryProps & { block?: Block }) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Block rendering error:', {
        error,
        errorInfo,
        block: this.props.block,
        blockName: this.props.block?.name
      });
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.props.block);
    }

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo);
    }
  }

  private reportErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Implementation would depend on your error monitoring service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    
    try {
      // Example structure for error reporting
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        blockName: this.props.block?.name,
        blockId: this.props.block?.id || this.props.block?.clientId,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined
      };

      // Send to your monitoring service
      // Example: Sentry.captureException(error, { extra: errorReport });
      console.error('Block error report:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report block error:', reportingError);
    }
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || BlockFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error!}
          {...(this.props.block?.name && { blockName: this.props.block.name })}
          {...(this.props.block && { block: this.props.block })}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withBlockErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<{ error: Error; blockName?: string; block?: Block }>
) {
  return function BlockErrorBoundaryWrapper(props: P & { block?: Block }) {
    return (
      <BlockErrorBoundary 
        {...(fallbackComponent && { fallback: fallbackComponent })} 
        {...(props.block && { block: props.block })}
      >
        <WrappedComponent {...props} />
      </BlockErrorBoundary>
    );
  };
}

/**
 * Hook for handling errors in functional components
 */
export function useBlockErrorHandler(block?: Block) {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
    
    // Log error
    console.error('Block error:', {
      error,
      block,
      blockName: block?.name
    });

    // Report to monitoring service if available
    if (process.env.NODE_ENV === 'production') {
      // Example: reportErrorToService(error, block);
    }
  }, [block]);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError
  };
}

export default BlockErrorBoundary;