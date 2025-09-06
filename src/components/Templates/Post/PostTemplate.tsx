import { print } from "graphql/language/printer";

import type { ContentNode, Post } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { Badge } from "@/components/ui/badge";

import { PostQuery } from "./PostQuery";

interface TemplateProps {
  node: ContentNode;
}

export default async function PostTemplate({ node }: TemplateProps) {
  const { post } = await fetchGraphQL<{ post: Post }>(print(PostQuery), {
    id: node.databaseId,
  });

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="space-y-6">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Badge variant="secondary">
              By {post.author?.node.name}
            </Badge>
            {post.date && (
              <time className="text-sm">
                {new Date(post.date).toLocaleDateString()}
              </time>
            )}
          </div>
        </header>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
        </div>
      </article>
    </main>
  );
}
