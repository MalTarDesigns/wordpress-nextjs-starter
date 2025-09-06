import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { clearPreviewCookies, getPreviewStateFromCookies } from "@/lib/preview/cookies";
import { envConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "/";

    // Get current preview state for logging
    const previewState = getPreviewStateFromCookies(request);
    if (previewState) {
      console.log("Exiting preview mode", {
        contentId: previewState.contentId,
        contentType: previewState.contentType,
        userId: previewState.userId,
        duration: Date.now() - previewState.startTime,
      });
    }

    // Disable draft mode
    draftMode().disable();

    // Create redirect response
    const redirectUrl = new URL(path, envConfig.site.baseUrl);
    // Remove preview-specific query parameters
    redirectUrl.searchParams.delete("preview");
    redirectUrl.searchParams.delete("type");
    redirectUrl.searchParams.delete("status");

    const response = NextResponse.redirect(redirectUrl.toString());

    // Clear all preview-related cookies
    clearPreviewCookies(response);

    // Add headers to prevent caching
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("X-Preview-Mode", "disabled");

    return response;
  } catch (error) {
    console.error("Exit preview error:", error);
    
    // Create fallback response
    const fallbackResponse = NextResponse.redirect(envConfig.site.baseUrl);
    clearPreviewCookies(fallbackResponse);
    
    return fallbackResponse;
  }
}

/**
 * Handle POST requests for programmatic preview exit
 */
export async function POST(request: NextRequest) {
  try {
    const { returnPath } = await request.json();
    
    // Disable draft mode
    draftMode().disable();

    // Clear preview cookies
    const response = NextResponse.json({ success: true, redirected: false });
    clearPreviewCookies(response);

    return response;
  } catch (error) {
    console.error("Preview exit POST error:", error);
    return NextResponse.json(
      { error: "Failed to exit preview mode" },
      { status: 500 }
    );
  }
}
