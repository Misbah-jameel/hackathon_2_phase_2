'use client';

import { createContext, useCallback, useState, ReactNode } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { Toast, ToastViewport } from '@/components/ui/Toast';
import { generateId } from '@/lib/utils';
import { TOAST_DURATION } from '@/lib/constants';
import type { Notification, NotificationType } from '@/types';

interface ToastContextValue {
  /** Show a toast notification */
  toast: (message: string, type?: NotificationType, duration?: number) => void;
  /** Show a success toast */
  success: (message: string, duration?: number) => void;
  /** Show an error toast */
  error: (message: string, duration?: number) => void;
  /** Show an info toast */
  info: (message: string, duration?: number) => void;
  /** Dismiss a specific toast by ID */
  dismiss: (id: string) => void;
  /** Dismiss all toasts */
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const toast = useCallback(
    (
      message: string,
      type: NotificationType = 'info',
      duration: number = TOAST_DURATION.DEFAULT
    ) => {
      const id = generateId();
      const notification: Notification = {
        id,
        type,
        message,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);

      // Return the ID so the caller can dismiss it if needed
      return id;
    },
    []
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      return toast(message, 'success', duration);
    },
    [toast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      return toast(message, 'error', duration ?? TOAST_DURATION.LONG);
    },
    [toast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      return toast(message, 'info', duration);
    },
    [toast]
  );

  const contextValue: ToastContextValue = {
    toast,
    success,
    error,
    info,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onDismiss={dismiss}
          />
        ))}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
