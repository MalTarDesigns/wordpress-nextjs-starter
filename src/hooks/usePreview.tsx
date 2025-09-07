"use client";

/**
 * Preview Mode Context and Hooks
 * Provides comprehensive preview state management and utilities
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Preview state interface
export interface PreviewState {
  isActive: boolean;
  contentId?: string;
  contentType?: "post" | "page";
  contentStatus?: "draft" | "pending" | "private" | "publish";
  userId?: string;
  username?: string;
  userRoles?: string[];
  startTime?: number;
  lastActivity?: number;
  canEdit?: boolean;
  canPublish?: boolean;
  isLoading?: boolean;
  error?: string;
}

// Preview context interface
export interface PreviewContextType {
  state: PreviewState;
  refreshPreview: () => void;
  exitPreview: (returnPath?: string) => Promise<void>;
  updateActivity: () => void;
  refreshToken: () => Promise<boolean>;
  isSessionExpired: () => boolean;
  getTimeRemaining: () => number;
  validateAccess: (requiredPermission?: "edit" | "publish") => boolean;
}

// Create context
const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

// Cookie parsing utilities
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function parseCookieData<T>(cookieName: string): T | null {
  try {
    const cookie = getCookie(cookieName);
    if (!cookie) return null;
    return JSON.parse(decodeURIComponent(cookie));
  } catch {
    return null;
  }
}

// Preview provider component
export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<PreviewState>({
    isActive: false,
    isLoading: true,
  });
  
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize preview state from cookies and URL
  const initializePreviewState = useCallback(() => {
    const isPreviewUrl = searchParams.get("preview") === "true";
    const previewStateCookie = parseCookieData<{
      isActive: boolean;
      contentId?: string;
      contentType?: "post" | "page";
      userId?: string;
      username?: string;
      startTime: number;
      lastActivity: number;
    }>("wp_preview_state");
    
    const userDataCookie = parseCookieData<{
      id: string;
      username: string;
      roles: string[];
      capabilities: string[];
    }>("wp_user_data");

    const contentStatus = searchParams.get("status") as PreviewState["contentStatus"] | null;
    const contentType = searchParams.get("type") as PreviewState["contentType"] | null;
    
    const newState = {
      isActive: isPreviewUrl && !!previewStateCookie?.isActive,
      ...(previewStateCookie?.contentId && { contentId: previewStateCookie.contentId }),
      ...(contentType || previewStateCookie?.contentType ? { contentType: contentType || previewStateCookie?.contentType } : {}),
      ...(contentStatus ? { contentStatus } : {}),
      ...(previewStateCookie?.userId || userDataCookie?.id ? { userId: previewStateCookie?.userId || userDataCookie?.id } : {}),
      ...(previewStateCookie?.username || userDataCookie?.username ? { username: previewStateCookie?.username || userDataCookie?.username } : {}),
      userRoles: userDataCookie?.roles || [],
      ...(previewStateCookie?.startTime && { startTime: previewStateCookie.startTime }),
      ...(previewStateCookie?.lastActivity && { lastActivity: previewStateCookie.lastActivity }),
      canEdit: userDataCookie?.roles?.some(role => ["administrator", "editor", "author"].includes(role)) || false,
      canPublish: userDataCookie?.roles?.some(role => ["administrator", "editor"].includes(role)) || false,
      isLoading: false,
    } as PreviewState;

    setState(newState);
    return newState;
  }, [searchParams]);

  // Refresh preview data
  const refreshPreview = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    const newState = initializePreviewState();
    
    if (newState.isActive) {
      updateActivity();
    }
  }, [initializePreviewState]);

  // Exit preview mode
  const exitPreview = useCallback(async (returnPath?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const exitPath = returnPath || pathname.replace("/preview/", "/").replace("/private/", "/");
      
      // Try POST request first for programmatic exit
      try {
        await fetch("/api/exit-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ returnPath: exitPath }),
        });
        
        // Navigate to the exit path
        router.push(exitPath);
      } catch {
        // Fallback to GET request
        window.location.href = `/api/exit-preview?path=${encodeURIComponent(exitPath)}`;
      }
    } catch (error) {
      console.error("Failed to exit preview:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to exit preview mode",
      }));
    }
  }, [pathname, router]);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    if (!state.isActive) return;

    const now = Date.now();
    
    // Update cookie
    try {
      const currentState = parseCookieData<any>("wp_preview_state");
      if (currentState) {
        const updatedState = { ...currentState, lastActivity: now };
        document.cookie = `wp_preview_state=${encodeURIComponent(JSON.stringify(updatedState))}; path=/; max-age=${2 * 60 * 60}`;
      }
    } catch (error) {
      console.error("Failed to update activity:", error);
    }

    setState(prev => ({ ...prev, lastActivity: now }));
  }, [state.isActive]);

  // Refresh authentication token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = getCookie("wp_refresh_token");
      if (!refreshToken) {
        console.warn("No refresh token available");
        return false;
      }

      const response = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error("Token refresh failed:", response.status);
        return false;
      }

      const data = await response.json();
      if (data.success) {
        console.log("Token refreshed successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  }, []);

  // Check if session is expired
  const isSessionExpired = useCallback((): boolean => {
    if (!state.isActive || !state.lastActivity) return false;
    
    const now = Date.now();
    const maxInactive = 30 * 60 * 1000; // 30 minutes
    
    return (now - state.lastActivity) > maxInactive;
  }, [state.isActive, state.lastActivity]);

  // Get time remaining in session
  const getTimeRemaining = useCallback((): number => {
    if (!state.isActive || !state.lastActivity) return 0;
    
    const now = Date.now();
    const maxInactive = 30 * 60 * 1000; // 30 minutes
    const elapsed = now - state.lastActivity;
    
    return Math.max(0, maxInactive - elapsed);
  }, [state.isActive, state.lastActivity]);

  // Validate user access
  const validateAccess = useCallback((requiredPermission?: "edit" | "publish"): boolean => {
    if (!state.isActive || !state.userRoles) return false;
    
    if (requiredPermission === "publish") {
      return state.canPublish || false;
    }
    
    if (requiredPermission === "edit") {
      return state.canEdit || false;
    }
    
    return true; // Basic preview access
  }, [state.isActive, state.userRoles, state.canEdit, state.canPublish]);

  // Initialize on mount
  useEffect(() => {
    initializePreviewState();
  }, [initializePreviewState]);

  // Set up activity tracking
  useEffect(() => {
    if (!state.isActive) return;

    const handleActivity = () => updateActivity();
    
    // Track user interactions
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Set up periodic activity updates
    activityTimerRef.current = setInterval(() => {
      if (state.isActive && !isSessionExpired()) {
        updateActivity();
      }
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
    };
  }, [state.isActive, updateActivity, isSessionExpired]);

  // Set up token refresh timer
  useEffect(() => {
    if (!state.isActive) return;

    // Refresh token every 30 minutes
    tokenRefreshRef.current = setInterval(async () => {
      const success = await refreshToken();
      if (!success) {
        console.warn("Token refresh failed, user may need to re-authenticate");
      }
    }, 30 * 60 * 1000);

    return () => {
      if (tokenRefreshRef.current) {
        clearInterval(tokenRefreshRef.current);
      }
    };
  }, [state.isActive, refreshToken]);

  // Handle session expiration
  useEffect(() => {
    if (state.isActive && isSessionExpired()) {
      console.warn("Preview session expired");
      setState(prev => ({
        ...prev,
        error: "Session expired. Please refresh to continue.",
      }));
    }
  }, [state.isActive, isSessionExpired]);

  const contextValue: PreviewContextType = {
    state,
    refreshPreview,
    exitPreview,
    updateActivity,
    refreshToken,
    isSessionExpired,
    getTimeRemaining,
    validateAccess,
  };

  return (
    <PreviewContext.Provider value={contextValue}>
      {children}
    </PreviewContext.Provider>
  );
}

// Hook to use preview context
export function usePreview(): PreviewContextType {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error("usePreview must be used within a PreviewProvider");
  }
  return context;
}

// Hook for preview state only (lighter alternative)
export function usePreviewState(): PreviewState {
  const { state } = usePreview();
  return state;
}

// Hook for preview actions only
export function usePreviewActions() {
  const {
    refreshPreview,
    exitPreview,
    updateActivity,
    refreshToken,
    validateAccess,
  } = usePreview();
  
  return {
    refreshPreview,
    exitPreview,
    updateActivity,
    refreshToken,
    validateAccess,
  };
}

// Hook for preview session management
export function usePreviewSession() {
  const {
    state,
    isSessionExpired,
    getTimeRemaining,
    refreshToken,
  } = usePreview();

  return {
    isActive: state.isActive,
    isExpired: isSessionExpired(),
    timeRemaining: getTimeRemaining(),
    refresh: refreshToken,
    username: state.username,
    userRoles: state.userRoles,
  };
}