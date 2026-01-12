'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  getMe,
  isApiError,
} from '@/lib/api';
import {
  restoreToken,
  clearAuthState,
  persistToken,
} from '@/lib/auth';
import { ROUTES } from '@/lib/constants';
import type { LoginInput, SignupInput, AuthState } from '@/types';

interface AuthContextValue extends AuthState {
  /** Login with email and password */
  login: (input: LoginInput, returnTo?: string) => Promise<{ success: boolean; error?: string }>;
  /** Register a new account */
  signup: (input: SignupInput, returnTo?: string) => Promise<{ success: boolean; error?: string }>;
  /** Logout the current user */
  logout: () => Promise<void>;
  /** Refresh the current user data */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = restoreToken();

      if (token) {
        // Validate token by fetching user
        const result = await getMe();

        if (!isApiError(result) && result.data) {
          setState({
            user: result.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Token invalid, clear auth state
          clearAuthState();
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (
      input: LoginInput,
      returnTo?: string
    ): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true }));

      const result = await apiLogin(input);

      if (isApiError(result)) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error.message };
      }

      // Persist token and update state
      persistToken(result.data.token);
      setState({
        user: result.data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Redirect to dashboard or return URL
      const redirectUrl = returnTo || ROUTES.DASHBOARD;
      router.push(redirectUrl);

      return { success: true };
    },
    [router]
  );

  const signup = useCallback(
    async (
      input: SignupInput,
      returnTo?: string
    ): Promise<{ success: boolean; error?: string }> => {
      setState((prev) => ({ ...prev, isLoading: true }));

      const result = await apiSignup(input);

      if (isApiError(result)) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error.message };
      }

      // Persist token and update state
      persistToken(result.data.token);
      setState({
        user: result.data.user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Redirect to dashboard or return URL
      const redirectUrl = returnTo || ROUTES.DASHBOARD;
      router.push(redirectUrl);

      return { success: true };
    },
    [router]
  );

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    await apiLogout();
    clearAuthState();

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    router.push(ROUTES.HOME);
  }, [router]);

  const refreshUser = useCallback(async () => {
    const result = await getMe();

    if (!isApiError(result) && result.data) {
      setState((prev) => ({
        ...prev,
        user: result.data,
        isAuthenticated: true,
      }));
    }
  }, []);

  const contextValue: AuthContextValue = {
    ...state,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
