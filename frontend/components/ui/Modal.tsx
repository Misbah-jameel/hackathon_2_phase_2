'use client';

import { useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
}

function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  // On mobile: full-screen. On desktop: constrained widths
  const sizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    full: 'sm:max-w-2xl',
  };

  // Handle escape key
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscapeKey]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 bg-black/50 z-50',
            'data-[state=open]:animate-fade-in',
            'data-[state=closed]:animate-fade-out'
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed z-50',
            // Mobile: full-screen
            'inset-0 sm:inset-auto',
            'sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
            // Sizing
            'w-full',
            'sm:rounded-xl',
            // Colors
            'bg-white dark:bg-dark-100',
            'shadow-xl',
            // Padding
            'p-4 sm:p-6',
            // Animation
            'data-[state=open]:animate-slide-up',
            'focus:outline-none',
            // Scrolling
            'max-h-full sm:max-h-[90vh] overflow-y-auto',
            // Desktop: constrained width
            sizes[size]
          )}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between mb-4">
              {title && (
                <Dialog.Title className="text-xl font-semibold text-gray-primary dark:text-white pr-12">
                  {title}
                </Dialog.Title>
              )}
              {showCloseButton && (
                <Dialog.Close asChild>
                  <button
                    className={cn(
                      'absolute top-3 right-3 sm:top-4 sm:right-4',
                      'p-2.5 rounded-lg',
                      'min-w-[44px] min-h-[44px] flex items-center justify-center',
                      'text-gray-secondary dark:text-gray-400',
                      'hover:text-gray-primary dark:hover:text-white',
                      'hover:bg-gray-100 dark:hover:bg-dark-200',
                      'transition-colors duration-200',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                    )}
                    aria-label="Close modal"
                  >
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
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </Dialog.Close>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <Dialog.Description
              id="modal-description"
              className="text-gray-secondary dark:text-gray-400 mb-4"
            >
              {description}
            </Dialog.Description>
          )}

          {/* Content */}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Confirm Modal Variant
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
}

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-secondary dark:text-gray-400 mb-6">{message}</p>
      {/* Actions - Stack on mobile, inline on desktop */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <button
          onClick={onClose}
          disabled={isLoading}
          className={cn(
            'px-4 py-3 sm:py-2 rounded-lg font-medium',
            'min-h-[48px] sm:min-h-[44px]',
            'border border-gray-border dark:border-dark-border',
            'text-gray-primary dark:text-white',
            'hover:bg-gray-100 dark:hover:bg-dark-200',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            'px-4 py-3 sm:py-2 rounded-lg font-medium',
            'min-h-[48px] sm:min-h-[44px]',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variant === 'danger'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white'
          )}
        >
          {isLoading ? 'Loading...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}

export { Modal, ConfirmModal };
