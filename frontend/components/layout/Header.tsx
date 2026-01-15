'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="glass sticky top-0 z-40 border-b border-gray-border dark:border-dark-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 group min-h-[44px] min-w-[44px]"
          >
            <span className="text-xl sm:text-2xl font-bold gradient-text">Todo</span>
            <span className="text-xl sm:text-2xl font-bold text-gray-primary dark:text-white">App</span>
            <span className="text-xl sm:text-2xl" aria-hidden="true">✨</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <ThemeToggle />

            {isLoading ? (
              <div className="flex items-center gap-4">
                <div className="h-8 w-20 bg-gray-200 dark:bg-dark-200 rounded animate-pulse" />
              </div>
            ) : isAuthenticated ? (
              <>
                <Link
                  href={ROUTES.DASHBOARD}
                  className={cn(
                    'text-sm font-medium transition-colors px-3 py-2 rounded-lg min-h-[44px] flex items-center gap-2',
                    isActive(ROUTES.DASHBOARD)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-primary dark:text-gray-300 hover:text-primary hover:bg-primary/5'
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="9" />
                    <rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" />
                    <rect x="3" y="16" width="7" height="5" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href={ROUTES.TASKS}
                  className={cn(
                    'text-sm font-medium transition-colors px-3 py-2 rounded-lg min-h-[44px] flex items-center',
                    isActive(ROUTES.TASKS)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-primary dark:text-gray-300 hover:text-primary hover:bg-primary/5'
                  )}
                >
                  My Tasks
                </Link>
                <div className="flex items-center gap-3 lg:gap-4">
                  <span className="text-sm text-gray-secondary dark:text-gray-400 hidden lg:inline">
                    {user?.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="min-h-[44px]"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  className={cn(
                    'text-sm font-medium transition-colors px-3 py-2 rounded-lg min-h-[44px] flex items-center',
                    isActive(ROUTES.LOGIN)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-primary dark:text-gray-300 hover:text-primary hover:bg-primary/5'
                  )}
                >
                  Login
                </Link>
                <Link href={ROUTES.SIGNUP}>
                  <Button size="sm" className="min-h-[44px]">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              className={cn(
                'p-2.5 rounded-lg transition-colors',
                'text-gray-primary dark:text-white',
                'hover:bg-gray-100 dark:hover:bg-dark-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                'min-h-[44px] min-w-[44px] flex items-center justify-center'
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <svg
                  width="24"
                  height="24"
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
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
}
