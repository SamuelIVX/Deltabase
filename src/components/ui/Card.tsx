import React from 'react';
import styles from './Card.module.css';

/**
 * Props for the root Card component.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Surface variant: 'default' for static cards, 'interactive' for hover elevation.
   * @default 'default'
   */
  variant?: 'default' | 'interactive';
}

/**
 * Root Card primitive container supporting default and interactive hover states.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variantClass = variant === 'interactive' ? styles.interactive : '';
    const combinedClassName = [styles.card, variantClass, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

/**
 * Header section of a Card, providing vertical alignment and padding for titles.
 */
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', children, ...props }, ref) => {
  const combinedClassName = [styles.header, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={combinedClassName} {...props}>
      {children}
    </div>
  );
});
CardHeader.displayName = 'CardHeader';

/**
 * Primary title typography for a Card header.
 */
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', children, ...props }, ref) => {
  const combinedClassName = [styles.title, className].filter(Boolean).join(' ');
  return (
    <h3 ref={ref} className={combinedClassName} {...props}>
      {children}
    </h3>
  );
});
CardTitle.displayName = 'CardTitle';

/**
 * Secondary subtitle or description typography for a Card header.
 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = '', children, ...props }, ref) => {
  const combinedClassName = [styles.description, className].filter(Boolean).join(' ');
  return (
    <p ref={ref} className={combinedClassName} {...props}>
      {children}
    </p>
  );
});
CardDescription.displayName = 'CardDescription';

/**
 * Body content container of a Card, applying standard horizontal and bottom padding.
 */
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', children, ...props }, ref) => {
  const combinedClassName = [styles.content, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={combinedClassName} {...props}>
      {children}
    </div>
  );
});
CardContent.displayName = 'CardContent';

/**
 * Footer section of a Card with a top border divider for action buttons or metrics.
 */
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', children, ...props }, ref) => {
  const combinedClassName = [styles.footer, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={combinedClassName} {...props}>
      {children}
    </div>
  );
});
CardFooter.displayName = 'CardFooter';
