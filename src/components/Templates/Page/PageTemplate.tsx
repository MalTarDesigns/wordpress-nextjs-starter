import { print } from "graphql/language/printer";
import type { ContentNode, Page } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { PageQuery } from "./PageQuery";
import BlockRenderer from "@/components/BlockRenderer";

interface TemplateProps {
  node: ContentNode;
}

export default async function PageTemplate({ node }: TemplateProps) {
  const { page } = await fetchGraphQL<{ page: Page }>(print(PageQuery), {
    variables: { id: node.databaseId },
  });

  const pageContent = page?.content || "";

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="prose prose-lg dark:prose-invert max-w-none">
        {/* Use BlockRenderer to parse and render WordPress blocks */}
        <BlockRenderer 
          content={pageContent}
          className="block-content"
          options={{
            validateAttributes: true,
            stripInvalidBlocks: true
          }}
        />
        
        {/* Fallback to raw HTML if BlockRenderer returns no blocks */}
        {!pageContent && (
          <div className="text-gray-500 italic text-center py-8">
            No content available
          </div>
        )}
      </article>
    </main>
  );
}
