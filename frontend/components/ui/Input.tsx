'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/s+/g, '-');

    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={inputId}
            className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5'
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'w-full px-4 py-3 rounded-xl outline-none transition-all duration-300',
            'bg-light-100 dark:bg-dark-card border',
            'placeholder:text-gray-400',
            'focus:ring-2 focus:ring-primary focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-light-border dark:border-dark-border hover:border-primary/50',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'text-gray-800 dark:text-white',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? inputId + '-error' : helperText ? inputId + '-helper' : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={inputId + '-error'}
            className='mt-1.5 text-sm text-red-500'
            role='alert'
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={inputId + '-helper'} className='mt-1.5 text-sm text-gray-500'>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/s+/g, '-');

    return (
      <div className='w-full'>
        {label && (
          <label
            htmlFor={textareaId}
            className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5'
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 resize-y min-h-[100px]',
            'bg-light-100 dark:bg-dark-card border',
            'placeholder:text-gray-400',
            'focus:ring-2 focus:ring-primary focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-light-border dark:border-dark-border hover:border-primary/50',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'text-gray-800 dark:text-white',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? textareaId + '-error' : helperText ? textareaId + '-helper' : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={textareaId + '-error'}
            className='mt-1.5 text-sm text-red-500'
            role='alert'
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={textareaId + '-helper'} className='mt-1.5 text-sm text-gray-500'>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
