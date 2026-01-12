'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          {/* Animated Background */}
          <div className='animated-bg' />
          <div className='particles'>
            <div className='particle' />
            <div className='particle' />
            <div className='particle' />
          </div>
          {children}
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
