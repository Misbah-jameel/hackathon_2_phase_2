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
            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-primary dark:text-gray-300 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5"
              aria-label="View source on GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>

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
