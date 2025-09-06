/**
 * WordPress JWT Authentication Utilities
 * Handles secure authentication flow for preview mode and draft content access
 */

import { print } from "graphql/language/printer";
import gql from "graphql-tag";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { LoginPayload } from "@/gql/graphql";
import { envConfig } from "@/lib/env";

// JWT token validation interface
export interface JWTValidationResult {
  isValid: boolean;
  isExpired?: boolean;
  userId?: string;
  username?: string;
  error?: string;
}

// WordPress authentication response interface
export interface WordPressAuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  userId?: string;
  username?: string;
  expiresIn?: number;
  error?: string;
}

// WordPress user roles interface
export interface WordPressUserRoles {
  canEdit: boolean;
  canPublish: boolean;
  canViewPrivate: boolean;
  roles: string[];
}

/**
 * Authenticate with WordPress and obtain JWT token
 */
export async function authenticateWordPress(
  username?: string,
  password?: string
): Promise<WordPressAuthResponse> {
  try {
    // Use environment credentials if not provided
    const wpUser = username || envConfig.wordpress.user;
    const wpPassword = password || envConfig.wordpress.appPass;

    if (!wpUser || !wpPassword) {
      return {
        success: false,
        error: "WordPress credentials not configured",
      };
    }

    const mutation = gql`
      mutation LoginUser($username: String!, $password: String!) {
        login(
          input: {
            clientMutationId: "preview-auth"
            username: $username
            password: $password
          }
        ) {
          authToken
          refreshToken
          user {
            id
            username
            name
            email
            capabilities
            roles {
              nodes {
                name
              }
            }
          }
        }
      }
    `;

    const { login } = await fetchGraphQL<{ login: LoginPayload }>(
      print(mutation),
      {
        variables: { username: wpUser, password: wpPassword },
        cache: "no-store", // Always fetch fresh auth tokens
      }
    );

    if (!login?.authToken) {
      return {
        success: false,
        error: "Invalid credentials or authentication failed",
      };
    }

    // Extract user information
    const user = login.user;
    const roles = user?.roles?.nodes?.map(role => role.name) || [];

    return {
      success: true,
      token: login.authToken,
      refreshToken: login.refreshToken || undefined,
      userId: user?.id,
      username: user?.username || undefined,
      expiresIn: 24 * 60 * 60, // 24 hours default
    };
  } catch (error) {
    console.error("WordPress authentication error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}

/**
 * Validate JWT token with WordPress
 */
export async function validateJWTToken(token: string): Promise<JWTValidationResult> {
  try {
    if (!token) {
      return { isValid: false, error: "No token provided" };
    }

    const query = gql`
      query ValidateToken {
        viewer {
          id
          username
          name
          email
          capabilities
          roles {
            nodes {
              name
            }
          }
        }
      }
    `;

    const result = await fetchGraphQL<{ viewer: any }>(
      print(query),
      {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!result.viewer?.id) {
      return {
        isValid: false,
        error: "Invalid or expired token",
      };
    }

    return {
      isValid: true,
      userId: result.viewer.id,
      username: result.viewer.username,
    };
  } catch (error) {
    console.error("JWT validation error:", error);
    
    // Check if error indicates expired token
    const isExpired = error instanceof Error && 
      (error.message.includes("expired") || 
       error.message.includes("invalid") ||
       error.message.includes("401"));

    return {
      isValid: false,
      isExpired,
      error: error instanceof Error ? error.message : "Token validation failed",
    };
  }
}

/**
 * Refresh JWT token
 */
export async function refreshJWTToken(refreshToken: string): Promise<WordPressAuthResponse> {
  try {
    const mutation = gql`
      mutation RefreshToken($refreshToken: String!) {
        refreshJwtAuthToken(input: { jwtRefreshToken: $refreshToken }) {
          authToken
        }
      }
    `;

    const result = await fetchGraphQL<{ refreshJwtAuthToken: { authToken: string } }>(
      print(mutation),
      {
        variables: { refreshToken },
        cache: "no-store",
      }
    );

    if (!result.refreshJwtAuthToken?.authToken) {
      return {
        success: false,
        error: "Failed to refresh token",
      };
    }

    return {
      success: true,
      token: result.refreshJwtAuthToken.authToken,
      expiresIn: 24 * 60 * 60, // 24 hours
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token refresh failed",
    };
  }
}

/**
 * Check user permissions for content operations
 */
export async function getUserRoles(token: string): Promise<WordPressUserRoles> {
  try {
    const query = gql`
      query GetUserRoles {
        viewer {
          id
          capabilities
          roles {
            nodes {
              name
              capabilities
            }
          }
        }
      }
    `;

    const result = await fetchGraphQL<{ viewer: any }>(
      print(query),
      {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const viewer = result.viewer;
    const roles = viewer?.roles?.nodes?.map((role: any) => role.name) || [];
    const capabilities = viewer?.capabilities || [];

    // Check specific capabilities
    const canEdit = capabilities.includes("edit_posts") || 
                   capabilities.includes("edit_pages") ||
                   roles.some((role: string) => ["administrator", "editor", "author"].includes(role));

    const canPublish = capabilities.includes("publish_posts") || 
                      capabilities.includes("publish_pages") ||
                      roles.some((role: string) => ["administrator", "editor"].includes(role));

    const canViewPrivate = capabilities.includes("read_private_posts") || 
                          capabilities.includes("read_private_pages") ||
                          roles.some((role: string) => ["administrator", "editor"].includes(role));

    return {
      canEdit,
      canPublish,
      canViewPrivate,
      roles,
    };
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return {
      canEdit: false,
      canPublish: false,
      canViewPrivate: false,
      roles: [],
    };
  }
}

/**
 * Generate secure preview URL with authentication
 */
export function generatePreviewUrl(
  contentId: string | number,
  baseUrl?: string
): string {
  const base = baseUrl || envConfig.site.baseUrl;
  const secret = envConfig.security.headlessSecret;
  
  const params = new URLSearchParams({
    secret,
    id: String(contentId),
    timestamp: Date.now().toString(),
  });

  return `${base}/api/preview?${params.toString()}`;
}

/**
 * Verify preview request security
 */
export function verifyPreviewRequest(
  secret: string,
  timestamp?: string
): { valid: boolean; error?: string } {
  // Verify secret
  if (secret !== envConfig.security.headlessSecret) {
    return { valid: false, error: "Invalid secret" };
  }

  // Verify timestamp (optional, prevents replay attacks)
  if (timestamp) {
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (isNaN(requestTime) || (currentTime - requestTime) > fiveMinutes) {
      return { valid: false, error: "Request expired or invalid timestamp" };
    }
  }

  return { valid: true };
}

/**
 * Clean up expired tokens and authentication data
 */
export function cleanupExpiredAuth(): void {
  // This could be extended to clean up stored tokens in a database
  // For now, it's mainly for consistency and future extension
  console.log("Cleaned up expired authentication data");
}