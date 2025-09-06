'use client';

import React from 'react';
import Link from 'next/link';
import type { BlockComponentProps, ButtonBlock } from '@/types/blocks';

interface CoreButtonProps extends BlockComponentProps<ButtonBlock> {}

export function CoreButton({ 
  block, 
  attributes, 
  className,
  isNested = false 
}: CoreButtonProps) {
  const {
    text = '',
    url = '',
    title,
    target,
    rel,
    backgroundColor,
    textColor,
    gradient,
    width,
    borderRadius,
    style
  } = attributes;

  // Handle empty button
  if (!text && !url) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div 
          className="wp-block-button bg-gray-100 border-2 border-dashed border-gray-300 p-4 text-center text-gray-500"
          data-block-name={block.name}
          data-empty-button
        >
          Empty button
        </div>
      );
    }
    return null;
  }

  // Build button styles
  const buttonStyles: React.CSSProperties = {
    ...(textColor && { color: textColor }),
    ...(backgroundColor && { backgroundColor }),
    ...(gradient && { background: gradient }),
    ...(borderRadius && { borderRadius: `${borderRadius}px` }),
    ...(width && { width: `${width}px` }),
    // Apply custom styles from the style object
    ...(style?.color?.text && { color: style.color.text }),
    ...(style?.color?.background && { backgroundColor: style.color.background }),
    ...(style?.color?.gradient && { background: style.color.gradient }),
    ...(style?.border?.radius && { borderRadius: style.border.radius }),
    ...(style?.border?.width && { borderWidth: style.border.width }),
    ...(style?.border?.color && { borderColor: style.border.color }),
    ...(style?.spacing?.padding && {
      paddingTop: style.spacing.padding.top,
      paddingRight: style.spacing.padding.right,
      paddingBottom: style.spacing.padding.bottom,
      paddingLeft: style.spacing.padding.left
    })
  };

  // Build CSS classes for the wrapper
  const wrapperClasses = [
    'wp-block-button',
    width && 'has-custom-width',
    className
  ].filter(Boolean).join(' ');

  // Build CSS classes for the button element
  const buttonClasses = [
    'wp-block-button__link',
    'wp-element-button',
    backgroundColor && `has-${backgroundColor}-background-color`,
    textColor && `has-${textColor}-color`,
    gradient && 'has-background'
  ].filter(Boolean).join(' ');

  // Button props
  const buttonProps = {
    className: buttonClasses,
    style: buttonStyles,
    'data-block-name': block.name,
    ...(title && { title }),
    ...(target && { target }),
    ...(rel && { rel }),
    ...(target === '_blank' && !rel && { rel: 'noopener noreferrer' })
  };

  // Determine if this is an internal or external link
  const isInternalLink = url && (url.startsWith('/') || url.startsWith('#'));
  const isExternalLink = url && (url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:'));

  // Render button content
  const ButtonContent = () => (
    <span dangerouslySetInnerHTML={{ __html: text }} />
  );

  // Render appropriate link type
  const ButtonElement = () => {
    if (!url) {
      // Button without URL (e.g., for JavaScript handling)
      return (
        <button {...buttonProps} type="button">
          <ButtonContent />
        </button>
      );
    }

    if (isInternalLink) {
      // Use Next.js Link for internal links
      return (
        <Link href={url} {...buttonProps}>
          <ButtonContent />
        </Link>
      );
    }

    if (isExternalLink) {
      // Regular anchor tag for external links
      return (
        <a href={url} {...buttonProps}>
          <ButtonContent />
        </a>
      );
    }

    // Fallback for other URL types
    return (
      <a href={url} {...buttonProps}>
        <ButtonContent />
      </a>
    );
  };

  return (
    <div className={wrapperClasses} data-block-name={block.name}>
      <ButtonElement />
    </div>
  );
}

export default CoreButton;