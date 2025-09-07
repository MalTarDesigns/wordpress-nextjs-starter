/**
 * Preview Cookie Management Utilities
 * Handles secure cookie management for WordPress JWT tokens and preview state
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { envConfig, isDevelopment } from "@/lib/env";

// Cookie configuration constants
export const PREVIEW_COOKIES = {
  JWT_TOKEN: "wp_jwt",
  REFRESH_TOKEN: "wp_refresh_token",
  PREVIEW_STATE: "wp_preview_state",
  USER_DATA: "wp_user_data",
} as const;

// Cookie options interface
export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  domain?: string;
  path?: string;
}

// Preview state data interface
export interface PreviewState {
  isActive: boolean;
  contentId?: string;
  contentType?: "post" | "page";
  userId?: string;
  username?: string;
  startTime: number;
  lastActivity: number;
}

// User data interface for cookie storage
export interface UserCookieData {
  id: string;
  username: string;
  roles: string[];
  capabilities: string[];
}

/**
 * Get default cookie options based on environment
 */
function getDefaultCookieOptions(): CookieOptions {
  const isSecure = !isDevelopment();
  
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours
  };
}

/**
 * Set JWT token cookie
 */
export async function setJWTTokenCookie(
  token: string,
  response?: NextResponse,
  options?: Partial<CookieOptions>
): Promise<void> {
  const cookieOptions = {
    ...getDefaultCookieOptions(),
    ...options,
  };

  const cookieString = `${PREVIEW_COOKIES.JWT_TOKEN}=${token}; ${formatCookieOptions(cookieOptions)}`;

  if (response) {
    response.headers.set("Set-Cookie", cookieString);
  } else {
    // Server-side cookie setting
    (await cookies()).set(PREVIEW_COOKIES.JWT_TOKEN, token, cookieOptions);
  }
}

/**
 * Get JWT token from cookies
 */
export async function getJWTTokenFromCookies(request?: NextRequest): Promise<string | null> {
  if (request) {
    return request.cookies.get(PREVIEW_COOKIES.JWT_TOKEN)?.value || null;
  }
  
  // Server-side cookie reading
  const cookieStore = await cookies();
  return cookieStore.get(PREVIEW_COOKIES.JWT_TOKEN)?.value || null;
}

/**
 * Set refresh token cookie
 */
export function setRefreshTokenCookie(
  refreshToken: string,
  response?: NextResponse,
  options?: Partial<CookieOptions>
): void {
  const cookieOptions = {
    ...getDefaultCookieOptions(),
    maxAge: 7 * 24 * 60 * 60, // 7 days for refresh token
    ...options,
  };

  const cookieString = `${PREVIEW_COOKIES.REFRESH_TOKEN}=${refreshToken}; ${formatCookieOptions(cookieOptions)}`;

  if (response) {
    response.headers.append("Set-Cookie", cookieString);
  } else {
    cookies().set(PREVIEW_COOKIES.REFRESH_TOKEN, refreshToken, cookieOptions);
  }
}

/**
 * Get refresh token from cookies
 */
export function getRefreshTokenFromCookies(request?: NextRequest): string | null {
  if (request) {
    return request.cookies.get(PREVIEW_COOKIES.REFRESH_TOKEN)?.value || null;
  }
  
  return cookies().get(PREVIEW_COOKIES.REFRESH_TOKEN)?.value || null;
}

/**
 * Set preview state cookie
 */
export function setPreviewStateCookie(
  state: PreviewState,
  response?: NextResponse
): void {
  const cookieOptions = {
    ...getDefaultCookieOptions(),
    httpOnly: false, // Allow client-side access for preview state
    maxAge: 2 * 60 * 60, // 2 hours for preview session
  };

  const stateString = JSON.stringify(state);
  const cookieString = `${PREVIEW_COOKIES.PREVIEW_STATE}=${encodeURIComponent(stateString)}; ${formatCookieOptions(cookieOptions)}`;

  if (response) {
    response.headers.append("Set-Cookie", cookieString);
  } else {
    cookies().set(PREVIEW_COOKIES.PREVIEW_STATE, stateString, cookieOptions);
  }
}

/**
 * Get preview state from cookies
 */
export function getPreviewStateFromCookies(request?: NextRequest): PreviewState | null {
  try {
    let stateString: string | undefined;
    
    if (request) {
      stateString = request.cookies.get(PREVIEW_COOKIES.PREVIEW_STATE)?.value;
    } else {
      stateString = cookies().get(PREVIEW_COOKIES.PREVIEW_STATE)?.value;
    }

    if (!stateString) {
      return null;
    }

    const decodedString = decodeURIComponent(stateString);
    return JSON.parse(decodedString) as PreviewState;
  } catch (error) {
    console.error("Error parsing preview state cookie:", error);
    return null;
  }
}

/**
 * Set user data cookie (minimal data for client-side use)
 */
export function setUserDataCookie(
  userData: UserCookieData,
  response?: NextResponse
): void {
  const cookieOptions = {
    ...getDefaultCookieOptions(),
    httpOnly: false, // Allow client-side access
    maxAge: 24 * 60 * 60, // 24 hours
  };

  const userString = JSON.stringify(userData);
  const cookieString = `${PREVIEW_COOKIES.USER_DATA}=${encodeURIComponent(userString)}; ${formatCookieOptions(cookieOptions)}`;

  if (response) {
    response.headers.append("Set-Cookie", cookieString);
  } else {
    cookies().set(PREVIEW_COOKIES.USER_DATA, userString, cookieOptions);
  }
}

/**
 * Get user data from cookies
 */
export function getUserDataFromCookies(request?: NextRequest): UserCookieData | null {
  try {
    let userString: string | undefined;
    
    if (request) {
      userString = request.cookies.get(PREVIEW_COOKIES.USER_DATA)?.value;
    } else {
      userString = cookies().get(PREVIEW_COOKIES.USER_DATA)?.value;
    }

    if (!userString) {
      return null;
    }

    const decodedString = decodeURIComponent(userString);
    return JSON.parse(decodedString) as UserCookieData;
  } catch (error) {
    console.error("Error parsing user data cookie:", error);
    return null;
  }
}

/**
 * Clear all preview-related cookies
 */
export function clearPreviewCookies(response?: NextResponse): void {
  const expiredCookieOptions = {
    expires: new Date(0),
    path: "/",
  };

  const cookiesToClear = Object.values(PREVIEW_COOKIES);
  const clearCookieStrings = cookiesToClear.map(
    cookieName => `${cookieName}=; ${formatCookieOptions(expiredCookieOptions)}`
  );

  if (response) {
    clearCookieStrings.forEach(cookieString => {
      response.headers.append("Set-Cookie", cookieString);
    });
  } else {
    // Server-side cookie clearing
    const cookieStore = cookies();
    cookiesToClear.forEach(cookieName => {
      cookieStore.delete(cookieName);
    });
  }
}

/**
 * Update preview activity timestamp
 */
export function updatePreviewActivity(request?: NextRequest): PreviewState | null {
  const currentState = getPreviewStateFromCookies(request);
  
  if (!currentState) {
    return null;
  }

  const updatedState: PreviewState = {
    ...currentState,
    lastActivity: Date.now(),
  };

  setPreviewStateCookie(updatedState);
  return updatedState;
}

/**
 * Check if preview session is expired
 */
export function isPreviewSessionExpired(
  state: PreviewState,
  maxInactiveMinutes: number = 30
): boolean {
  const now = Date.now();
  const maxInactiveMs = maxInactiveMinutes * 60 * 1000;
  
  return (now - state.lastActivity) > maxInactiveMs;
}

/**
 * Create preview state for new session
 */
export function createPreviewState(
  contentId?: string,
  contentType?: "post" | "page",
  userData?: UserCookieData
): PreviewState {
  const now = Date.now();
  
  return {
    isActive: true,
    contentId,
    contentType,
    userId: userData?.id,
    username: userData?.username,
    startTime: now,
    lastActivity: now,
  };
}

/**
 * Format cookie options into string
 */
function formatCookieOptions(options: CookieOptions): string {
  const parts: string[] = [];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  return parts.join("; ");
}

/**
 * Validate cookie security settings
 */
export function validateCookieSecurity(): {
  isSecure: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let isSecure = true;

  if (isDevelopment()) {
    warnings.push("Development mode: cookies are not secure");
    isSecure = false;
  }

  if (!envConfig.site.baseUrl.startsWith("https://") && !isDevelopment()) {
    warnings.push("HTTPS not detected: cookies may not be secure");
    isSecure = false;
  }

  if (envConfig.security.headlessSecret.length < 32) {
    warnings.push("Headless secret is too short for secure cookie encryption");
    isSecure = false;
  }

  return { isSecure, warnings };
}