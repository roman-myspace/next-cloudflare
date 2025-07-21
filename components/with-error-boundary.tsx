/*
  withErrorBoundary.tsx
  A single, smart HOC for wrapping any client component with an Error Boundary.
  - Uses react-error-boundary under the hood
  - Offers optional fallback UI & retry logic
  - Keeps your component code clean and focused on UI
*/

'use client';

import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

/**
 * Options for customizing the error boundary behavior.
 */
export type ErrorBoundaryOptions = {
  /**
   * Custom fallback UI (rendered above the Retry button).
   * If omitted, a default message with error.message is shown.
   */
  fallbackUI?: React.ReactNode;
  /**
   * Custom retry callback, e.g. invalidate React Query or reload window.
   */
  retryCallback?: () => void;
};

/**
 * A generic HOC that wraps any component in an error boundary.
 * @param Component - The component to wrap
 * @param options - Optional fallback UI & retry callback
 */
export function withErrorBoundary(
  Component: React.ComponentType,
  options?: ErrorBoundaryOptions
): React.FC {
  const { fallbackUI, retryCallback } = options || {};

  return function WrappedWithErrorBoundary(props: any) {
    return (
      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }: FallbackProps) => (
          <div className="p-4 border rounded bg-red-50 text-red-700">
            <div className="mb-4">
              {fallbackUI ? (
                fallbackUI
              ) : (
                <>
                  <p className="font-semibold">Something went wrong:</p>
                  <p className="mt-1">{error.message}</p>
                </>
              )}
            </div>
            <button
              onClick={() => {
                // call custom retry logic if provided
                retryCallback?.();
                // reset boundary to remount component
                resetErrorBoundary();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Retry
            </button>
          </div>
        )}
        onReset={() => {
          /* boundary state reset, nothing else needed here */
        }}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/*
  Usage Example (in one file):

  'use client';
  import { useQuery, useQueryClient } from '@tanstack/react-query';
  import { fetchProducts } from '@/api/products';
  import { withErrorBoundary } from './withErrorBoundary';

  function ProductListContent() {
    const { data, isLoading, error } = useQuery({
      queryKey: ['products'],
      queryFn: fetchProducts,
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) throw error;

    return (
      <div className="grid grid-cols-3 gap-4">
        {data.map(product => (
          <div key={product.id} className="p-4 border rounded">
            <h2 className="font-medium">{product.name}</h2>
          </div>
        ))}
      </div>
    );
  }

  // Wrap & export, passing optional UI & retry logic:
  export default withErrorBoundary(ProductListContent, {
    fallbackUI: (
      <div>
        <p className="text-lg font-bold">Oops, products failed to load.</p>
      </div>
    ),
    retryCallback: () => {
      // e.g., invalidate queries or reload page
      const qc = useQueryClient();
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
*/
