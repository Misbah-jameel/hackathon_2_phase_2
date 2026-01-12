'use client';

import { useState } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

export interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function Toast({ notification, onDismiss }: ToastProps) {
  const [open, setOpen] = useState(true);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Delay removal to allow exit animation
      setTimeout(() => onDismiss(notification.id), 200);
    }
  };

  const icons = {
    success: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-500"
        aria-hidden="true"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
    error: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-red-500"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    info: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-500"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  const borderColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
  };

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={handleOpenChange}
      duration={notification.duration || 5000}
      className={cn(
        'bg-white rounded-lg shadow-lg border border-gray-border border-l-4',
        'p-4 pr-8',
        'data-[state=open]:animate-slide-up',
        'data-[state=closed]:animate-fade-out',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
        'data-[swipe=end]:animate-fade-out',
        borderColors[notification.type]
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5">{icons[notification.type]}</span>
        <div className="flex-1 min-w-0">
          <ToastPrimitive.Description className="text-sm text-gray-primary">
            {notification.message}
          </ToastPrimitive.Description>
        </div>
      </div>
      <ToastPrimitive.Close
        className={cn(
          'absolute top-2 right-2',
          'p-1.5 rounded-md',
          'text-gray-secondary hover:text-gray-primary hover:bg-gray-100',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        )}
        aria-label="Dismiss notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

// Toast Viewport - where toasts are rendered
function ToastViewport() {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        'fixed bottom-0 right-0 z-[100]',
        'flex flex-col gap-2',
        'p-4 w-full max-w-sm',
        'outline-none'
      )}
    />
  );
}

export { Toast, ToastViewport };
