import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { clsx } from 'clsx';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'relative inline-flex h-10 w-20 items-center justify-between',
        'rounded-full border-2 transition-all duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'hover:scale-105 active:scale-95',
        isDark
          ? 'border-primary-400/50 bg-gradient-to-r from-primary-900/80 to-purple-900/80'
          : 'border-primary-200/70 bg-gradient-to-r from-primary-50 to-purple-50'
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {/* Background glow effect */}
      <div className={clsx(
        'absolute inset-0 rounded-full opacity-20 blur-sm transition-all duration-300',
        isDark ? 'bg-purple-500' : 'bg-primary-300'
      )} />
      
      {/* Sun Icon */}
      <div className={clsx(
        'relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300',
        'ml-1.5',
        !isDark 
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg transform scale-110' 
          : 'bg-transparent text-primary-400/60 transform scale-90'
      )}>
        <SunIcon className="h-4 w-4" />
      </div>

      {/* Moon Icon */}
      <div className={clsx(
        'relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300',
        'mr-1.5',
        isDark 
          ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg transform scale-110' 
          : 'bg-transparent text-gray-400/60 transform scale-90'
      )}>
        <MoonIcon className="h-4 w-4" />
      </div>

      {/* Sliding indicator */}
      <div 
        className={clsx(
          'absolute top-1 h-8 w-8 rounded-full transition-all duration-300 ease-in-out',
          'bg-gradient-to-br shadow-lg backdrop-blur-sm',
          isDark
            ? 'right-1 from-purple-500/90 to-blue-500/90 shadow-purple-500/50'
            : 'left-1 from-yellow-400/90 to-orange-500/90 shadow-yellow-500/50'
        )}
      />
      
      {/* Sparkle effects for light mode */}
      {!isDark && (
        <>
          <div className="absolute top-2 left-3 h-1 w-1 bg-yellow-300 rounded-full animate-pulse" />
          <div className="absolute bottom-2 left-4 h-0.5 w-0.5 bg-orange-400 rounded-full animate-ping" />
        </>
      )}
      
      {/* Star effects for dark mode */}
      {isDark && (
        <>
          <div className="absolute top-2 right-3 h-1 w-1 bg-purple-300 rounded-full animate-pulse" />
          <div className="absolute bottom-2 right-4 h-0.5 w-0.5 bg-blue-400 rounded-full animate-ping" />
        </>
      )}
    </button>
  );
};
