/**
 * Preview-Specific GraphQL Queries
 * Enhanced queries for draft content, private posts, and preview functionality
 */

import gql from "graphql-tag";

// Enhanced content node query for preview mode with all necessary fields
export const PREVIEW_CONTENT_NODE_QUERY = gql`
  query PreviewContentNode($id: ID!, $idType: ContentNodeIdTypeEnum = DATABASE_ID, $asPreview: Boolean = true) {
    contentNode(id: $id, idType: $idType, asPreview: $asPreview) {
      __typename
      id
      databaseId
      uri
      slug
      status
      date
      dateGmt
      modified
      modifiedGmt
      title
      content
      excerpt
      featuredImage {
        node {
          id
          altText
          sourceUrl(size: LARGE)
          mediaDetails {
            width
            height
          }
        }
      }
      seo {
        title
        metaDesc
        metaKeywords
        opengraphTitle
        opengraphDescription
        opengraphImage {
          sourceUrl
        }
      }
      author {
        node {
          id
          name
          slug
          description
          avatar {
            url
          }
        }
      }
      contentType {
        node {
          name
          label
          public
          hierarchical
          hasArchive
          isFrontPage
          isPostsPage
        }
      }
      
      # Additional fields for posts
      ... on Post {
        postId
        categories {
          nodes {
            id
            name
            slug
            uri
          }
        }
        tags {
          nodes {
            id
            name
            slug
          }
        }
        commentCount
        commentStatus
        sticky
      }
      
      # Additional fields for pages
      ... on Page {
        pageId
        parent {
          node {
            id
            title
            uri
          }
        }
        children {
          nodes {
            id
            title
            uri
          }
        }
        menuOrder
        template {
          templateName
        }
        isFrontPage
        isPostsPage
      }
      
      # Additional fields for custom post types
      ... on NodeWithTemplate {
        template {
          templateName
        }
      }
      
      # Preview-specific metadata
      previewRevisionDatabaseId
      previewRevisionId
      isRevision
      isPreview
    }
  }
`;

// Query for getting draft posts with preview capabilities
export const PREVIEW_DRAFT_POSTS_QUERY = gql`
  query PreviewDraftPosts($first: Int = 10, $after: String, $authorId: Int) {
    posts(
      first: $first
      after: $after
      where: { 
        status: DRAFT
        author: $authorId
      }
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        databaseId
        title
        excerpt
        date
        modified
        status
        slug
        uri
        author {
          node {
            id
            name
            slug
          }
        }
        featuredImage {
          node {
            id
            sourceUrl(size: MEDIUM)
            altText
          }
        }
        categories {
          nodes {
            id
            name
            slug
          }
        }
        commentCount
        previewRevisionDatabaseId
        previewRevisionId
      }
    }
  }
`;

// Query for getting private content
export const PREVIEW_PRIVATE_CONTENT_QUERY = gql`
  query PreviewPrivateContent($first: Int = 10, $contentTypes: [ContentTypeEnum]) {
    contentNodes(
      first: $first
      where: { 
        status: PRIVATE
        contentTypes: $contentTypes
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        __typename
        id
        databaseId
        title
        excerpt
        date
        modified
        status
        uri
        contentType {
          node {
            name
            label
          }
        }
        author {
          node {
            id
            name
          }
        }
        
        ... on Post {
          postId
        }
        
        ... on Page {
          pageId
        }
      }
    }
  }
`;

// Query for checking content revisions and preview status
export const PREVIEW_REVISION_QUERY = gql`
  query PreviewRevision($id: ID!, $revisionId: ID) {
    contentNode(id: $id) {
      id
      databaseId
      status
      date
      modified
      title
      content
      excerpt
      
      # Get the specific revision if provided
      ... on NodeWithRevisions {
        revisions(first: 5, where: { id: $revisionId }) {
          nodes {
            id
            databaseId
            date
            modified
            title
            content
            excerpt
            author {
              node {
                id
                name
              }
            }
            isRevision
          }
        }
      }
      
      # Current preview revision
      previewRevisionDatabaseId
      previewRevisionId
    }
  }
`;

// Query for content preview metadata and permissions
export const PREVIEW_METADATA_QUERY = gql`
  query PreviewMetadata($id: ID!) {
    contentNode(id: $id) {
      id
      databaseId
      status
      date
      modified
      title
      slug
      uri
      
      author {
        node {
          id
          name
          capabilities
        }
      }
      
      contentType {
        node {
          name
          label
          public
          canExport
          deleteWithUser
          excludeFromSearch
          hierarchical
          hasArchive
          menuIcon
          menuPosition
          publiclyQueryable
          restBase
          restControllerClass
          showInAdminBar
          showInGraphql
          showInMenu
          showInNavMenus
          showInRest
          showUi
        }
      }
      
      # Check edit capabilities
      enqueuedStylesheets {
        nodes {
          id
        }
      }
      
      enqueuedScripts {
        nodes {
          id
        }
      }
    }
    
    # Get current user info for permission checks
    viewer {
      id
      name
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

// Query for getting pending content that needs review
export const PREVIEW_PENDING_CONTENT_QUERY = gql`
  query PreviewPendingContent($first: Int = 10, $contentTypes: [ContentTypeEnum]) {
    contentNodes(
      first: $first
      where: { 
        status: PENDING
        contentTypes: $contentTypes
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        __typename
        id
        databaseId
        title
        excerpt
        date
        modified
        status
        uri
        contentType {
          node {
            name
            label
          }
        }
        author {
          node {
            id
            name
            email
          }
        }
        
        ... on Post {
          postId
          categories {
            nodes {
              name
            }
          }
        }
        
        ... on Page {
          pageId
          parent {
            node {
              title
            }
          }
        }
      }
    }
  }
`;

// Enhanced user authentication query for preview mode
export const PREVIEW_AUTH_QUERY = gql`
  query PreviewAuthUser {
    viewer {
      id
      databaseId
      username
      name
      firstName
      lastName
      email
      description
      url
      locale
      nicename
      nickname
      registeredDate
      
      # User capabilities
      capabilities
      capKey
      
      # User roles with detailed permissions
      roles {
        nodes {
          id
          name
          displayName
          capabilities
        }
      }
      
      # User meta information
      extraCapabilities
      
      # Avatar
      avatar {
        url
        foundAvatar
        extraAttr
      }
      
      # Content authored by this user
      posts(first: 5, where: { status: [DRAFT, PENDING, PRIVATE] }) {
        nodes {
          id
          title
          status
          date
        }
      }
      
      pages(first: 5, where: { status: [DRAFT, PENDING, PRIVATE] }) {
        nodes {
          id
          title
          status
          date
        }
      }
    }
  }
`;

// Query for content history and changes (useful for preview)
export const PREVIEW_CONTENT_HISTORY_QUERY = gql`
  query PreviewContentHistory($id: ID!, $first: Int = 10) {
    contentNode(id: $id) {
      id
      databaseId
      title
      status
      date
      modified
      
      # Get revisions/history
      ... on NodeWithRevisions {
        revisions(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
          pageInfo {
            hasNextPage
          }
          nodes {
            id
            databaseId
            date
            modified
            title
            content
            excerpt
            
            author {
              node {
                id
                name
              }
            }
            
            # Revision-specific fields
            isRevision
            guid
            parent {
              node {
                id
                databaseId
              }
            }
          }
        }
      }
    }
  }
`;

// Mutation for updating preview content
export const UPDATE_PREVIEW_CONTENT_MUTATION = gql`
  mutation UpdatePreviewContent(
    $id: ID!
    $title: String
    $content: String
    $status: PostStatusEnum
    $excerpt: String
  ) {
    updatePost(
      input: {
        id: $id
        title: $title
        content: $content
        status: $status
        excerpt: $excerpt
      }
    ) {
      post {
        id
        databaseId
        title
        content
        status
        date
        modified
        slug
        uri
        
        previewRevisionDatabaseId
        previewRevisionId
      }
    }
  }
`;

// Query for checking if content can be previewed
export const PREVIEW_CAPABILITY_CHECK_QUERY = gql`
  query PreviewCapabilityCheck($contentId: ID!, $userId: ID) {
    contentNode(id: $contentId) {
      id
      status
      date
      author {
        node {
          id
          name
        }
      }
      contentType {
        node {
          name
          public
          showInRest
        }
      }
    }
    
    user(id: $userId, idType: DATABASE_ID) {
      id
      name
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

// Types for TypeScript
export interface PreviewContentNode {
  __typename: string;
  id: string;
  databaseId: number;
  uri: string;
  slug: string;
  status: string;
  date: string;
  dateGmt: string;
  modified: string;
  modifiedGmt: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    node: {
      id: string;
      altText: string;
      sourceUrl: string;
      mediaDetails: {
        width: number;
        height: number;
      };
    };
  };
  seo?: {
    title: string;
    metaDesc: string;
    metaKeywords: string;
    opengraphTitle: string;
    opengraphDescription: string;
    opengraphImage?: {
      sourceUrl: string;
    };
  };
  author: {
    node: {
      id: string;
      name: string;
      slug: string;
      description: string;
      avatar: {
        url: string;
      };
    };
  };
  contentType: {
    node: {
      name: string;
      label: string;
      public: boolean;
      hierarchical: boolean;
      hasArchive: boolean;
      isFrontPage: boolean;
      isPostsPage: boolean;
    };
  };
  previewRevisionDatabaseId?: number;
  previewRevisionId?: string;
  isRevision?: boolean;
  isPreview?: boolean;
}

export interface PreviewAuthUser {
  id: string;
  databaseId: number;
  username: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  capabilities: string[];
  roles: {
    nodes: Array<{
      id: string;
      name: string;
      displayName: string;
      capabilities: string[];
    }>;
  };
  avatar: {
    url: string;
  };
}

export interface PreviewRevision {
  id: string;
  databaseId: number;
  date: string;
  modified: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    node: {
      id: string;
      name: string;
    };
  };
  isRevision: boolean;
}