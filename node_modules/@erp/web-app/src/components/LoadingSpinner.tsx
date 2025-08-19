import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={clsx(
          'animate-spin rounded-full border-b-2 border-primary-600',
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );
};

// Full page loading component
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          {message}
        </h2>
      </div>
    </div>
  );
};

// Inline loading component
export const InlineLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 p-8">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
