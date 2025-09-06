/**
 * WordPress Gutenberg and ACF Block Type Definitions
 * 
 * This file contains comprehensive type definitions for WordPress blocks,
 * including Gutenberg core blocks and ACF flexible content blocks.
 */

// Base block interfaces
export interface BaseBlock {
  id?: string;
  name: string;
  clientId?: string;
  isValid?: boolean;
  attributes: Record<string, any>;
  innerBlocks?: Block[];
  innerHTML?: string;
  innerContent?: (string | null)[];
}

// Gutenberg Block Types
export interface GutenbergBlock extends BaseBlock {
  blockName: string;
  attrs: Record<string, any>;
  innerHTML: string;
  innerContent: (string | null)[];
}

// ACF Flexible Content Block
export interface ACFFlexibleContentBlock {
  acf_fc_layout: string;
  [key: string]: any;
}

// ACF Block
export interface ACFBlock extends BaseBlock {
  blockName: string;
  data: Record<string, any>;
  mode?: 'preview' | 'edit' | 'auto';
  align?: 'left' | 'center' | 'right' | 'wide' | 'full';
  className?: string;
  anchor?: string;
}

// Union type for all block types
export type Block = GutenbergBlock | ACFBlock | ACFFlexibleContentBlock;

// Common Gutenberg Core Block Types
export interface ParagraphBlock extends GutenbergBlock {
  blockName: 'core/paragraph';
  attrs: {
    content?: string;
    dropCap?: boolean;
    placeholder?: string;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: string;
    style?: {
      color?: {
        text?: string;
        background?: string;
      };
      typography?: {
        fontSize?: string;
        lineHeight?: string;
      };
    };
  };
}

export interface HeadingBlock extends GutenbergBlock {
  blockName: 'core/heading';
  attrs: {
    content?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    textAlign?: 'left' | 'center' | 'right';
    placeholder?: string;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: string;
    anchor?: string;
  };
}

export interface ImageBlock extends GutenbergBlock {
  blockName: 'core/image';
  attrs: {
    id?: number;
    url?: string;
    alt?: string;
    caption?: string;
    title?: string;
    href?: string;
    rel?: string;
    linkClass?: string;
    linkTarget?: string;
    width?: number;
    height?: number;
    sizeSlug?: string;
    linkDestination?: string;
    align?: 'left' | 'center' | 'right' | 'wide' | 'full';
  };
}

export interface ListBlock extends GutenbergBlock {
  blockName: 'core/list';
  attrs: {
    values?: string;
    ordered?: boolean;
    start?: number;
    reversed?: boolean;
    placeholder?: string;
    type?: 'ul' | 'ol';
  };
}

export interface QuoteBlock extends GutenbergBlock {
  blockName: 'core/quote';
  attrs: {
    value?: string;
    citation?: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
  };
}

export interface CodeBlock extends GutenbergBlock {
  blockName: 'core/code';
  attrs: {
    content?: string;
  };
}

export interface EmbedBlock extends GutenbergBlock {
  blockName: 'core/embed' | 'core-embed/youtube' | 'core-embed/twitter' | 'core-embed/instagram' | 'core-embed/vimeo';
  attrs: {
    url?: string;
    caption?: string;
    type?: string;
    providerNameSlug?: string;
    responsive?: boolean;
    previewable?: boolean;
    className?: string;
  };
}

export interface ButtonBlock extends GutenbergBlock {
  blockName: 'core/button';
  attrs: {
    text?: string;
    url?: string;
    title?: string;
    target?: string;
    rel?: string;
    placeholder?: string;
    backgroundColor?: string;
    textColor?: string;
    gradient?: string;
    width?: number;
    className?: string;
    borderRadius?: number;
    style?: {
      border?: {
        radius?: string;
        width?: string;
        color?: string;
      };
      color?: {
        text?: string;
        background?: string;
        gradient?: string;
      };
      spacing?: {
        padding?: {
          top?: string;
          right?: string;
          bottom?: string;
          left?: string;
        };
      };
    };
  };
}

export interface ButtonsBlock extends GutenbergBlock {
  blockName: 'core/buttons';
  attrs: {
    contentJustification?: 'left' | 'center' | 'right' | 'space-between';
    orientation?: 'horizontal' | 'vertical';
  };
}

export interface ColumnsBlock extends GutenbergBlock {
  blockName: 'core/columns';
  attrs: {
    verticalAlignment?: 'top' | 'center' | 'bottom';
    isStackedOnMobile?: boolean;
  };
}

export interface ColumnBlock extends GutenbergBlock {
  blockName: 'core/column';
  attrs: {
    verticalAlignment?: 'top' | 'center' | 'bottom';
    width?: string;
  };
}

export interface GroupBlock extends GutenbergBlock {
  blockName: 'core/group';
  attrs: {
    backgroundColor?: string;
    textColor?: string;
    gradient?: string;
    className?: string;
    tagName?: 'div' | 'header' | 'main' | 'section' | 'article' | 'aside' | 'footer';
  };
}

export interface MediaTextBlock extends GutenbergBlock {
  blockName: 'core/media-text';
  attrs: {
    mediaId?: number;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    mediaWidth?: number;
    mediaPosition?: 'left' | 'right';
    verticalAlignment?: 'top' | 'center' | 'bottom';
    imageFill?: boolean;
    focalPoint?: {
      x: number;
      y: number;
    };
    href?: string;
    linkTarget?: string;
    rel?: string;
    linkClass?: string;
    useFeaturedImage?: boolean;
  };
}

export interface CoverBlock extends GutenbergBlock {
  blockName: 'core/cover';
  attrs: {
    url?: string;
    id?: number;
    hasParallax?: boolean;
    isRepeated?: boolean;
    dimRatio?: number;
    overlayColor?: string;
    customOverlayColor?: string;
    gradient?: string;
    customGradient?: string;
    backgroundType?: 'image' | 'video';
    focalPoint?: {
      x: number;
      y: number;
    };
    minHeight?: number;
    minHeightUnit?: 'px' | 'vh';
    contentPosition?: string;
    isDark?: boolean;
    allowedBlocks?: string[];
    templateLock?: boolean | string;
  };
}

export interface GalleryBlock extends GutenbergBlock {
  blockName: 'core/gallery';
  attrs: {
    images?: Array<{
      id: number;
      url: string;
      fullUrl: string;
      link: string;
      alt: string;
      caption: string;
    }>;
    ids?: number[];
    columns?: number;
    caption?: string;
    imageCrop?: boolean;
    fixedHeight?: boolean;
    linkTarget?: string;
    linkTo?: 'none' | 'file' | 'attachment';
    sizeSlug?: string;
    allowResize?: boolean;
  };
}

// ACF Block Examples
export interface HeroBlock extends ACFBlock {
  blockName: 'acf/hero';
  data: {
    title?: string;
    subtitle?: string;
    background_image?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    cta_button?: {
      title: string;
      url: string;
      target?: string;
    };
    text_color?: 'light' | 'dark';
  };
}

export interface TestimonialBlock extends ACFBlock {
  blockName: 'acf/testimonial';
  data: {
    quote?: string;
    author?: string;
    position?: string;
    company?: string;
    avatar?: {
      url: string;
      alt: string;
    };
    rating?: number;
  };
}

export interface CtaBlock extends ACFBlock {
  blockName: 'acf/cta';
  data: {
    title?: string;
    description?: string;
    button?: {
      title: string;
      url: string;
      target?: string;
    };
    background_color?: string;
    text_color?: string;
    layout?: 'left' | 'center' | 'right';
  };
}

// Block renderer props
export interface BlockRendererProps {
  block: Block;
  index?: number;
  isNested?: boolean;
  parentBlock?: Block;
}

// Block component props
export interface BlockComponentProps<T extends Block = Block> {
  block: T;
  attributes: T extends GutenbergBlock ? T['attrs'] : T extends ACFBlock ? T['data'] : any;
  innerHTML?: string;
  innerBlocks?: Block[];
  className?: string;
  isNested?: boolean;
  [key: string]: any;
}

// Error boundary props
export interface BlockErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; blockName?: string; block?: Block }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo, block?: Block) => void;
}

// Block registry types
export type BlockComponent = React.ComponentType<BlockComponentProps>;

export interface BlockRegistration {
  name: string;
  component: BlockComponent;
  category?: 'common' | 'formatting' | 'layout' | 'widgets' | 'embed' | 'theme' | 'custom';
  icon?: string;
  description?: string;
  supports?: {
    html?: boolean;
    align?: boolean | string[];
    anchor?: boolean;
    className?: boolean;
    color?: {
      background?: boolean;
      text?: boolean;
      gradients?: boolean;
    };
    spacing?: {
      padding?: boolean;
      margin?: boolean;
    };
    typography?: {
      fontSize?: boolean;
      lineHeight?: boolean;
    };
  };
}

export interface BlockRegistry {
  blocks: Map<string, BlockRegistration>;
  registerBlock: (registration: BlockRegistration) => void;
  unregisterBlock: (name: string) => boolean;
  getBlock: (name: string) => BlockRegistration | undefined;
  getAllBlocks: () => BlockRegistration[];
  hasBlock: (name: string) => boolean;
}

// Utility types
export type BlockName = 
  | 'core/paragraph'
  | 'core/heading'
  | 'core/image'
  | 'core/list'
  | 'core/quote'
  | 'core/code'
  | 'core/embed'
  | 'core/button'
  | 'core/buttons'
  | 'core/columns'
  | 'core/column'
  | 'core/group'
  | 'core/media-text'
  | 'core/cover'
  | 'core/gallery'
  | 'acf/hero'
  | 'acf/testimonial'
  | 'acf/cta'
  | string;

export interface BlockParserOptions {
  allowedBlocks?: string[];
  disallowedBlocks?: string[];
  stripInvalidBlocks?: boolean;
  validateAttributes?: boolean;
}

export interface ParsedBlockData {
  blocks: Block[];
  warnings?: string[];
  errors?: string[];
  metadata?: {
    totalBlocks: number;
    blockTypes: Record<string, number>;
    hasInvalidBlocks: boolean;
  };
}