import { draftMode, cookies } from "next/headers";
import type { GraphQLResponse, GraphQLError } from "@/types/wordpress";

// Enhanced fetch options for GraphQL requests
export interface GraphQLFetchOptions {
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
  timeout?: number;
}

// Custom error class for GraphQL errors
export class GraphQLError extends Error {
  constructor(
    message: string,
    public errors: GraphQLError[],
    public query?: string,
    public variables?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GraphQLError';
  }
}

// Custom error class for network errors
export class NetworkError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Type-safe GraphQL fetcher with enhanced error handling
export async function fetchGraphQL<TData = unknown>(
  query: string,
  options: GraphQLFetchOptions = {}
): Promise<TData> {
  const {
    variables = {},
    headers = {},
    cache = "default",
    revalidate,
    tags = ["wordpress"],
    timeout = 10000
  } = options;

  const { isEnabled: preview } = await draftMode();

  try {
    // Handle authentication for preview mode
    let authHeader = "";
    if (preview) {
      const cookieStore = await cookies();
      const auth = cookieStore.get("wp_jwt")?.value;
      if (auth) {
        authHeader = `Bearer ${auth}`;
      }
    }

    // Prepare request body
    const body = JSON.stringify({
      query,
      variables: {
        preview,
        ...variables,
      },
    });

    // Validate environment variables
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_WORDPRESS_API_URL environment variable is not set");
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Make the GraphQL request
    const response = await fetch(`${apiUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Next.js WordPress Client",
        ...(authHeader && { Authorization: authHeader }),
        ...headers,
      },
      body,
      cache: preview ? "no-cache" : cache,
      next: {
        revalidate: preview ? 0 : revalidate,
        tags,
      },
      signal: controller.signal,
    });

    // Clear timeout
    clearTimeout(timeoutId);

    // Handle network errors
    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      console.error("GraphQL Network Error:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        query: query.substring(0, 100) + "...",
        variables,
      });
      throw new NetworkError(errorMessage, response.status, response.statusText);
    }

    // Parse response
    const result: GraphQLResponse<TData> = await response.json();

    // Handle GraphQL errors
    if (result.errors && result.errors.length > 0) {
      const errorMessage = result.errors.map(err => err.message).join(", ");
      console.error("GraphQL Execution Errors:", {
        errors: result.errors,
        query: query.substring(0, 100) + "...",
        variables,
      });
      throw new GraphQLError(errorMessage, result.errors, query, variables);
    }

    // Validate that data exists
    if (!result.data) {
      throw new Error("GraphQL response contains no data");
    }

    return result.data;
  } catch (error) {
    // Re-throw custom errors as-is
    if (error instanceof GraphQLError || error instanceof NetworkError) {
      throw error;
    }

    // Handle abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`GraphQL request timeout after ${timeout}ms`);
    }

    // Handle other errors
    console.error("Unexpected GraphQL Error:", {
      error,
      query: query.substring(0, 100) + "...",
      variables,
    });
    throw error;
  }
}

// Convenience function for fetching with custom cache settings
export async function fetchGraphQLWithRevalidation<TData = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  revalidateSeconds: number = 3600
): Promise<TData> {
  return fetchGraphQL<TData>(query, {
    variables,
    revalidate: revalidateSeconds,
    cache: "force-cache",
  });
}

// Convenience function for fetching fresh data
export async function fetchGraphQLFresh<TData = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  return fetchGraphQL<TData>(query, {
    variables,
    cache: "no-store",
  });
}
