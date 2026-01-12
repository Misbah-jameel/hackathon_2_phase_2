/**
 * Better Auth Client Configuration
 */

import { ROUTES } from "./constants";
import { getAccessToken, setAccessToken } from "./api";

export const AUTH_CONFIG = {
  loginUrl: ROUTES.LOGIN,
  signupUrl: ROUTES.SIGNUP,
  dashboardUrl: ROUTES.DASHBOARD,
  tokenKey: "auth-token",
} as const;

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

export function getLoginRedirectUrl(returnTo?: string): string {
  if (returnTo) {
    return AUTH_CONFIG.loginUrl + "?returnTo=" + encodeURIComponent(returnTo);
  }
  return AUTH_CONFIG.loginUrl;
}

export function getPostLoginRedirectUrl(searchParams?: URLSearchParams): string {
  const returnTo = searchParams?.get("returnTo");
  return returnTo || AUTH_CONFIG.dashboardUrl;
}

export function clearAuthState(): void {
  setAccessToken(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
  }
}

export function persistToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_CONFIG.tokenKey, token);
    setAccessToken(token);
  }
}

export function restoreToken(): string | null {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
    if (token) {
      setAccessToken(token);
    }
    return token;
  }
  return null;
}

export function parseToken(token: string): {
  userId: string;
  email: string;
  exp: number;
} | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;
    const payload = JSON.parse(atob(base64Payload));
    return {
      userId: payload.sub || payload.userId,
      email: payload.email,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const parsed = parseToken(token);
  if (!parsed) return true;
  const expirationTime = parsed.exp * 1000;
  const now = Date.now();
  const bufferMs = 60 * 1000;
  return now >= expirationTime - bufferMs;
}
