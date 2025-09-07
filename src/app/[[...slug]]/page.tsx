import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { print } from "graphql/language/printer";

import { setSeoData, generateStructuredData, generateArticleStructuredData } from "@/utils/seoData";
import { fetchGraphQL, fetchGraphQLWithRevalidation } from "@/utils/fetchGraphQL";
import { ContentInfoQuery } from "@/queries/general/ContentInfoQuery";
import type { ContentNode, Page as WPPage, Post as WPPost } from "@/gql/graphql";
import PageTemplate from "@/components/Templates/Page/PageTemplate";
import { nextSlugToWpSlug } from "@/utils/nextSlugToWpSlug";
import PostTemplate from "@/components/Templates/Post/PostTemplate";
import { SeoQuery } from "@/queries/general/SeoQuery";
import type { WordPressMetadata } from "@/types/metadata";
import { isPage, isPost } from "@/types/wordpress";

// Enhanced props type with better typing
interface PageProps {
  params: {
    slug?: string[];
  };
  searchParams: {
    preview?: string;
    token?: string;
  };
}

// ISR revalidation settings
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Enable dynamic route generation
export const dynamic = 'force-static'; // Prefer static generation

// Enhanced metadata generation with structured data
export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<WordPressMetadata> {
  try {
    const slug = nextSlugToWpSlug(params.slug);
    const isPreview = searchParams.preview === 'true' || slug.includes("preview");
    
    // Use different cache strategy for preview vs. production
    const fetchOptions = {
      variables: {
        slug: isPreview ? slug.split("preview/")[1] : slug,
        idType: isPreview ? "DATABASE_ID" : "URI",
      },
      ...(isPreview ? { cache: 'no-store' as const } : { revalidate: 3600 }),
    };

    const { contentNode } = await fetchGraphQL<{ contentNode: ContentNode }>(
      print(SeoQuery),
      fetchOptions
    );

    if (!contentNode) {
      return {
        title: 'Page Not Found',
        description: 'The requested page could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // Build canonical URL
    const canonical = `${process.env.NEXT_PUBLIC_BASE_URL}${slug === '/' ? '' : slug}`;
    
    // Prepare content data for metadata generation
    const contentData = {
      title: contentNode.title,
      excerpt: contentNode.excerpt,
      publishedTime: contentNode.date,
      modifiedTime: contentNode.modified,
      ...(isPost(contentNode) && contentNode.author && {
        author: {
          name: contentNode.author.name,
          url: contentNode.author.uri,
        },
      }),
    };

    // Generate enhanced metadata with structured data
    const metadata = setSeoData({
      seo: contentNode.seo,
      content: contentData,
      canonical,
      type: isPost(contentNode) ? 'article' : 'website',
    });

    return {
      ...metadata,
      alternates: {
        canonical,
      },
      // Add structured data as a custom property
      other: {
        'structured-data': JSON.stringify(
          generateStructuredData(
            {
              seo: contentNode.seo,
              content: contentData,
              canonical,
            },
            contentNode.seo?.breadcrumbs?.filter((item): item is { text: string; url?: string } => Boolean(item.text))
          )
        ),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Return fallback metadata on error
    return {
      title: 'Error Loading Page',
      description: 'There was an error loading this page.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

// Static params generation for ISR
export async function generateStaticParams(): Promise<Array<{ slug: string[] }>> {
  // In production, you might want to fetch popular pages for static generation
  // For now, return empty array to generate all pages on-demand
  return [];
  
  // Example of how to generate static params for popular content:
  // try {
  //   const { posts } = await fetchGraphQLWithRevalidation<{ posts: { nodes: Post[] } }>(
  //     print(gql`
  //       query GetPopularPosts {
  //         posts(first: 50, where: { orderby: { field: COMMENT_COUNT, order: DESC } }) {
  //           nodes {
  //             slug
  //             uri
  //           }
  //         }
  //       }
  //     `),
  //     {},
  //     86400 // Cache for 24 hours
  //   );
  //   
  //   return posts.nodes.map(post => ({
  //     slug: post.uri.split('/').filter(Boolean)
  //   }));
  // } catch (error) {
  //   console.error('Error generating static params:', error);
  //   return [];
  // }
}

// Enhanced page component with better error handling and type safety
export default async function DynamicPage({
  params,
  searchParams,
}: PageProps) {
  try {
    const slug = nextSlugToWpSlug(params.slug);
    const isPreview = searchParams.preview === 'true' || slug.includes("preview");
    
    // Use different cache strategy for preview vs. production
    const fetchOptions = {
      variables: {
        slug: isPreview ? slug.split("preview/")[1] : slug,
        idType: isPreview ? "DATABASE_ID" : "URI",
      },
      ...(isPreview ? { cache: 'no-store' as const } : { revalidate: 3600 }),
      tags: ['wordpress', `content-${slug}`],
    };

    const { contentNode } = await fetchGraphQL<{ contentNode: ContentNode }>(
      print(ContentInfoQuery),
      fetchOptions
    );

    // Handle 404 cases
    if (!contentNode) {
      notFound();
    }

    // Generate structured data for the page
    const structuredData = isPost(contentNode)
      ? generateArticleStructuredData({
          seo: contentNode.seo,
          content: {
            title: contentNode.title,
            excerpt: contentNode.excerpt,
            publishedTime: contentNode.date,
            modifiedTime: contentNode.modified,
            author: contentNode.author ? {
              name: contentNode.author.name,
              url: contentNode.author.uri,
            } : undefined,
          },
          canonical: `${process.env.NEXT_PUBLIC_BASE_URL}${slug === '/' ? '' : slug}`,
        })
      : null;

    // Render appropriate template based on content type
    const content = (() => {
      switch (contentNode.contentTypeName) {
        case "page":
          return <PageTemplate node={contentNode as WPPage} />;
        case "post":
          return <PostTemplate node={contentNode as WPPost} />;
        default:
          console.warn(`Content type '${contentNode.contentTypeName}' not implemented`);
          return (
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold mb-4">Content Type Not Supported</h1>
              <p className="text-gray-600">
                The content type '{contentNode.contentTypeName}' is not yet implemented.
              </p>
              <div className="mt-8 p-4 bg-gray-100 rounded">
                <h2 className="font-semibold mb-2">Raw Content:</h2>
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(contentNode, null, 2)}
                </pre>
              </div>
            </div>
          );
      }
    })();

    return (
      <>
        {/* Inject structured data for articles */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        )}
        {content}
      </>
    );
  } catch (error) {
    console.error('Error rendering page:', error);
    
    // In production, you might want to render a more user-friendly error page
    if (process.env.NODE_ENV === 'production') {
      notFound();
    }
    
    // In development, show the error for debugging
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Content</h1>
        <p className="mb-4">There was an error loading this page:</p>
        <pre className="bg-red-50 p-4 rounded text-sm overflow-x-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}
