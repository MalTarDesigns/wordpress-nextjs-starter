# ACF Content Blocks Documentation

This directory contains advanced, production-ready content block components built with Next.js, TypeScript, and shadcn/ui. All blocks support dark mode, responsive design, and accessibility features.

## Available Blocks

### 1. Hero Section Block (`acf/hero-section`)
**File:** `HeroSection.tsx`

Advanced hero section with multiple layout options and enhanced features.

**Layouts:**
- `centered` - Traditional centered hero with all content in the middle
- `split` - Two-column layout with content on one side
- `minimal` - Clean, minimal design with just essentials
- `fullscreen` - Full viewport height with dramatic sizing

**Features:**
- Multiple background options (color, gradient, image, pattern)
- Overlay controls with opacity settings
- Parallax effect support
- Badge text and feature highlights
- Multiple CTA buttons with different styles
- Text alignment control
- Height variations (auto, medium, large, fullscreen)

**Props Structure:**
```typescript
{
  title: string;
  subtitle: string;
  description: string;
  background_image: { url: string; alt?: string };
  overlay_opacity: number; // 0-100
  layout: 'centered' | 'split' | 'minimal' | 'fullscreen';
  height: 'auto' | 'medium' | 'large' | 'fullscreen';
  text_alignment: 'left' | 'center' | 'right';
  cta_buttons: Array<{
    title: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline' | 'ghost';
  }>;
  badge_text: string;
  features: Array<{ icon: string; text: string }>;
}
```

---

### 2. Image Gallery Block (`acf/image-gallery`)
**File:** `ImageGallery.tsx`

Responsive image gallery with lightbox functionality and multiple layout options.

**Layouts:**
- `grid` - Traditional grid layout with responsive columns
- `masonry` - Pinterest-style masonry layout
- `carousel` - Horizontal scrolling carousel
- `justified` - Justified layout based on image aspect ratios

**Features:**
- Lightbox with keyboard navigation
- Multiple column configurations for different screen sizes
- Hover effects (zoom, fade, slide)
- Caption support (overlay or below)
- Rounded corners option
- Customizable gaps between images

**Props Structure:**
```typescript
{
  images: Array<{
    id: number;
    url: string;
    thumbnail?: string;
    alt: string;
    title?: string;
    caption?: string;
    width?: number;
    height?: number;
  }>;
  layout: 'grid' | 'masonry' | 'carousel' | 'justified';
  columns: number; // Desktop columns
  columns_tablet: number;
  columns_mobile: number;
  gap: 'none' | 'small' | 'medium' | 'large';
  enable_lightbox: boolean;
  show_captions: boolean;
  caption_position: 'overlay' | 'below';
  hover_effect: 'none' | 'zoom' | 'fade' | 'slide';
}
```

---

### 3. Testimonial Section Block (`acf/testimonial-section`)
**File:** `TestimonialSection.tsx`

Advanced testimonial section with ratings, avatars, and multiple display options.

**Layouts:**
- `grid` - Grid layout with configurable columns
- `carousel` - Auto-rotating carousel with navigation
- `masonry` - Masonry layout for varying content heights
- `featured` - Featured testimonial with supporting ones

**Features:**
- Star ratings (1-5 stars)
- Author avatars with fallback
- Auto-rotation for carousel
- Background patterns
- Card style variations (bordered, elevated, minimal, gradient)
- Tags and categories
- Helpful counters
- Date stamps

**Props Structure:**
```typescript
{
  testimonials: Array<{
    quote: string;
    author_name: string;
    author_title?: string;
    author_company?: string;
    author_image?: { url: string; alt?: string };
    rating?: number; // 1-5
    featured?: boolean;
    tags?: string[];
  }>;
  layout: 'grid' | 'carousel' | 'masonry' | 'featured';
  columns: number;
  card_style: 'bordered' | 'elevated' | 'minimal' | 'gradient';
  auto_rotate: boolean;
  rotation_interval: number; // milliseconds
}
```

---

### 4. FAQ Section Block (`acf/faq-section`)
**File:** `FAQSection.tsx`

Interactive FAQ section with accordion functionality, search, and filtering.

**Layouts:**
- `accordion` - Traditional accordion layout
- `cards` - Card-based expandable items
- `two-column` - Split into two columns

**Features:**
- Search functionality
- Category filtering
- Smooth accordion animations
- Multiple expansion modes (single vs multiple)
- Helpful counters
- Tags support
- Custom styling options

**Props Structure:**
```typescript
{
  faqs: Array<{
    question: string;
    answer: string; // HTML supported
    category?: string;
    featured?: boolean;
    helpful_count?: number;
    tags?: string[];
  }>;
  layout: 'accordion' | 'cards' | 'two-column';
  style: 'default' | 'bordered' | 'minimal' | 'gradient';
  allow_multiple_open: boolean;
  show_search: boolean;
  show_categories: boolean;
  default_expanded: string[]; // FAQ IDs
}
```

---

### 5. CTA Section Block (`acf/cta-section`)
**File:** `CTASection.tsx`

Advanced call-to-action section with multiple layouts and enhanced features.

**Layouts:**
- `centered` - Traditional centered CTA
- `split` - Content and features side by side
- `card` - Card-wrapped CTA
- `banner` - Horizontal banner style
- `minimal` - Clean, minimal design
- `features` - CTA with features list

**Features:**
- Multiple background types (color, gradient, image, pattern)
- Feature lists with icons
- Social proof elements
- Urgency messaging
- Badge text
- Multiple CTA buttons with icons
- Size variations

**Props Structure:**
```typescript
{
  title: string;
  subtitle: string;
  description: string;
  buttons: Array<{
    title: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon: 'arrow' | 'star' | 'check' | 'trending' | 'zap';
  }>;
  layout: 'centered' | 'split' | 'card' | 'banner' | 'minimal' | 'features';
  background_type: 'none' | 'color' | 'gradient' | 'image' | 'pattern';
  features: Array<{
    icon: string;
    title: string;
    description?: string;
  }>;
  badge_text: string;
  urgency_text: string;
  show_social_proof: boolean;
}
```

## Design System Integration

### Color Scheme
All blocks use the shadcn/ui color system with CSS variables:
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--muted` / `--muted-foreground`
- `--accent` / `--accent-foreground`

### Dark Mode Support
All blocks automatically support dark mode through:
- CSS custom properties that change based on `.dark` class
- Conditional styling based on background images
- Proper contrast ratios for accessibility

### Typography
- Responsive text sizing using Tailwind's responsive prefixes
- Text balancing for better readability
- Proper line heights and letter spacing

### Animations
Enhanced with custom CSS animations:
- Fade in/out effects
- Scale animations
- Stagger animations for child elements
- Smooth transitions

## Accessibility Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Lightbox supports arrow keys and Escape
- Accordions support Enter/Space activation

### Screen Readers
- Proper ARIA labels and roles
- Semantic HTML structure
- Image alt text support
- Focus management

### Color Contrast
- WCAG 2.1 AA compliant color contrasts
- Text overlays with proper backgrounds
- Focus indicators

## Performance Optimizations

### Images
- Next.js Image component with optimizations
- Lazy loading for gallery images
- Proper sizing attributes
- WebP format support

### Code Splitting
- Components are lazily loaded
- Suspense boundaries for loading states
- Error boundaries for graceful failures

### Animations
- GPU-accelerated transforms
- Will-change properties where appropriate
- Reduced motion support

## WordPress Integration

### ACF Field Groups
Each block should have corresponding ACF field groups in WordPress with:
- Proper field types (text, textarea, image, repeater, etc.)
- Validation rules
- Default values
- Conditional logic where appropriate

### Block Registration
Blocks are registered in `registerBlocks.ts` with:
- Proper categories
- Support configurations
- Icon assignments
- Descriptions

### GraphQL Queries
Ensure your WordPress GraphQL schema includes all required fields for each block type.

## Development Notes

### Adding New Layouts
To add a new layout to any block:
1. Add the layout option to the TypeScript interface
2. Create a new case in the render function
3. Update the WordPress ACF fields
4. Test responsiveness and accessibility

### Customizing Styles
- Use the CSS custom properties system
- Follow the existing class naming conventions
- Test in both light and dark modes
- Ensure responsive behavior

### Performance Testing
- Test with large image galleries
- Verify smooth animations on low-end devices
- Check bundle size impact
- Monitor Core Web Vitals

## Browser Support
- Modern evergreen browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Progressive enhancement for older browsers
- Graceful degradation of advanced features