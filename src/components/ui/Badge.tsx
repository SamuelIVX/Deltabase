import React from 'react';
import styles from './Badge.module.css';

/**
 * Variants supported by the Badge component.
 */
export type BadgeVariant = 'default' | 'outline' | 'gain' | 'loss' | 'accent';

/**
 * Props for the Badge primitive component.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual variant indicating status, direction, or category.
   * @default 'default'
   */
  variant?: BadgeVariant;
}

/**
 * Compact status badge primitive supporting directional gain/loss and categorical styling.
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variantClass = styles[variant] || styles.default;
    const combinedClassName = [styles.badge, variantClass, className]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} className={combinedClassName} {...props}>
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
