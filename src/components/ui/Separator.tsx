import React from 'react';
import styles from './Separator.module.css';

/**
 * Props for the Separator primitive component.
 */
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Orientation of the divider line.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Whether the element is purely decorative. If true, role is presentation/none.
   * If false, role="separator" and aria-orientation is provided for assistive tech.
   * @default true
   */
  decorative?: boolean;
}

/**
 * Accessible separator divider component supporting horizontal and vertical orientations.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      className = '',
      orientation = 'horizontal',
      decorative = true,
      ...props
    },
    ref
  ) => {
    const orientationClass =
      orientation === 'vertical' ? styles.vertical : styles.horizontal;
    const combinedClassName = [styles.separator, orientationClass, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={decorative ? undefined : orientation}
        className={combinedClassName}
        {...props}
      />
    );
  }
);
Separator.displayName = 'Separator';
