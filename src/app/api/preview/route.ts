import { print } from "graphql/language/printer";
import gql from "graphql-tag";
import { ContentNode } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { 
  authenticateWordPress, 
  verifyPreviewRequest, 
  validateJWTToken,
  getUserRoles 
} from "@/lib/auth/wordpress";
import { 
  setJWTTokenCookie,
  setRefreshTokenCookie,
  setPreviewStateCookie,
  setUserDataCookie,
  createPreviewState,
  clearPreviewCookies 
} from "@/lib/preview/cookies";
import { envConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

// Rate limiting for preview requests
const previewRequestLog = new Map<string, number[]>();
const MAX_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const requests = previewRequestLog.get(clientIP) || [];
  
  // Clean old requests
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  recentRequests.push(now);
  previewRequestLog.set(clientIP, recentRequests);
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const id = searchParams.get("id");
    const timestamp = searchParams.get("timestamp");
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      console.warn(`Preview rate limit exceeded for IP: ${clientIP}`);
      return new NextResponse("Too many requests", { status: 429 });
    }

    // Validate required parameters
    if (!secret || !id) {
      console.error("Preview request missing required parameters", { secret: !!secret, id: !!id });
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // Verify preview request security
    const securityCheck = verifyPreviewRequest(secret, timestamp || undefined);
    if (!securityCheck.valid) {
      console.error("Preview security check failed:", securityCheck.error);
      return new NextResponse(securityCheck.error || "Unauthorized", { status: 401 });
    }

    // Authenticate with WordPress
    console.log("Authenticating with WordPress for preview request");
    const authResult = await authenticateWordPress();
    
    if (!authResult.success || !authResult.token) {
      console.error("WordPress authentication failed:", authResult.error);
      return new NextResponse(
        authResult.error || "Authentication failed", 
        { status: 401 }
      );
    }

    const authToken = authResult.token;

    // Get user roles and permissions
    const userRoles = await getUserRoles(authToken);
    if (!userRoles.canEdit && !userRoles.canViewPrivate) {
      console.error("User lacks permission to preview content");
      return new NextResponse("Insufficient permissions", { status: 403 });
    }

    // Enable draft mode
    draftMode().enable();

    // Query content node with enhanced data
    const query = gql`
      query GetContentNode($id: ID!) {
        contentNode(id: $id, idType: DATABASE_ID) {
          id
          databaseId
          uri
          slug
          status
          title
          contentType {
            node {
              name
            }
          }
          date
          modified
          author {
            node {
              id
              name
            }
          }
        }
      }
    `;

    console.log("Fetching content node for preview", { id });
    const { contentNode } = await fetchGraphQL<{ contentNode: ContentNode }>(
      print(query),
      {
        variables: { id },
        cache: "no-store",
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (!contentNode) {
      console.error("Content node not found or access denied", { id });
      return new NextResponse("Content not found", { status: 404 });
    }

    // Validate content access permissions
    if (contentNode.status === "private" && !userRoles.canViewPrivate) {
      console.error("User cannot access private content");
      return new NextResponse("Cannot access private content", { status: 403 });
    }

    // Determine preview URL based on content status and type
    let previewPath: string;
    const contentType = contentNode.contentType?.node?.name?.toLowerCase() || "unknown";
    
    if (contentNode.status === "draft" || contentNode.status === "pending") {
      previewPath = `/preview/${contentNode.databaseId}`;
    } else if (contentNode.status === "private") {
      previewPath = `/private/${contentNode.databaseId}`;
    } else {
      previewPath = contentNode.uri || `/preview/${contentNode.databaseId}`;
    }

    // Create preview URL with query parameters for debugging
    const previewUrl = new URL(previewPath, envConfig.site.baseUrl);
    previewUrl.searchParams.set("preview", "true");
    previewUrl.searchParams.set("type", contentType);
    previewUrl.searchParams.set("status", contentNode.status || "unknown");

    console.log("Redirecting to preview URL", { 
      contentId: id, 
      status: contentNode.status, 
      type: contentType,
      previewPath 
    });

    // Create response with redirect
    const response = NextResponse.redirect(previewUrl.toString());

    // Set authentication cookies
    setJWTTokenCookie(authToken, response, { maxAge: 2 * 60 * 60 }); // 2 hours for preview
    
    if (authResult.refreshToken) {
      setRefreshTokenCookie(authResult.refreshToken, response);
    }

    // Set preview state cookie
    const previewState = createPreviewState(
      id,
      contentType === "page" ? "page" : "post",
      {
        id: authResult.userId || "unknown",
        username: authResult.username || "unknown",
        roles: userRoles.roles,
        capabilities: [], // Could be expanded
      }
    );
    
    setPreviewStateCookie(previewState, response);
    
    // Set user data cookie for client-side access
    setUserDataCookie({
      id: authResult.userId || "unknown",
      username: authResult.username || "unknown",
      roles: userRoles.roles,
      capabilities: [],
    }, response);

    // Add security headers
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("X-Preview-Mode", "enabled");

    return response;
    
  } catch (error) {
    console.error("Preview request error:", error);
    
    // Clear any potentially set cookies on error
    const errorResponse = new NextResponse(
      "Internal server error", 
      { status: 500 }
    );
    clearPreviewCookies(errorResponse);
    
    return errorResponse;
  }
}

/**
 * Handle POST requests for preview token refresh
 */
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return new NextResponse("Refresh token required", { status: 400 });
    }

    // Attempt to refresh the token
    const authResult = await authenticateWordPress();
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      token: authResult.token,
      expiresIn: authResult.expiresIn,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
