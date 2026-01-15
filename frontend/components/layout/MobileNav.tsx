'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { User } from '@/types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
}

const navVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2
    }
  })
};

export function MobileNav({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  onLogout
}: MobileNavProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  // Close nav when route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    onClose();
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Navigation Panel */}
          <motion.nav
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={navVariants}
            className="absolute top-full left-0 right-0 bg-white dark:bg-dark-100 border-t border-gray-border dark:border-dark-border shadow-lg z-50 md:hidden overflow-hidden"
            aria-label="Mobile navigation"
          >
            <div className="py-4 px-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <motion.div
                    custom={0}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="px-4 py-3 mb-2 rounded-xl bg-gray-50 dark:bg-dark-200"
                  >
                    <p className="text-sm font-medium text-gray-primary dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-secondary dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </motion.div>

                  {/* Dashboard Link */}
                  <motion.div
                    custom={1}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={ROUTES.DASHBOARD}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                        'min-h-[48px]',
                        isActive(ROUTES.DASHBOARD)
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-primary dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-200'
                      )}
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
                        <rect x="3" y="3" width="7" height="9" />
                        <rect x="14" y="3" width="7" height="5" />
                        <rect x="14" y="12" width="7" height="9" />
                        <rect x="3" y="16" width="7" height="5" />
                      </svg>
                      Dashboard
                    </Link>
                  </motion.div>

                  {/* Tasks Link */}
                  <motion.div
                    custom={2}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={ROUTES.TASKS}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                        'min-h-[48px]', // 48px touch target
                        isActive(ROUTES.TASKS)
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-primary dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-200'
                      )}
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
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      My Tasks
                    </Link>
                  </motion.div>

                  {/* Divider */}
                  <div className="my-2 border-t border-gray-border dark:border-dark-border" />

                  {/* Logout */}
                  <motion.div
                    custom={3}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <button
                      onClick={handleLogout}
                      className={cn(
                        'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium',
                        'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
                        'min-h-[48px]' // 48px touch target
                      )}
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
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Login Link */}
                  <motion.div
                    custom={0}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={ROUTES.LOGIN}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                        'min-h-[48px]',
                        isActive(ROUTES.LOGIN)
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-primary dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-200'
                      )}
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
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Login
                    </Link>
                  </motion.div>

                  {/* Signup Link */}
                  <motion.div
                    custom={1}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={ROUTES.SIGNUP}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium',
                        'bg-primary hover:bg-primary-light text-gray-primary transition-colors',
                        'min-h-[48px]'
                      )}
                    >
                      Get Started
                      <span aria-hidden="true">→</span>
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
