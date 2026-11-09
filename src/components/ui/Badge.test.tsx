import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, type BadgeVariant } from './Badge';

describe('Badge component suite', () => {
  it('renders default variant and forwards ref', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} data-testid="test-badge" className="custom-badge">
        Active
      </Badge>
    );

    const badge = screen.getByTestId('test-badge');
    expect(badge).toBeDefined();
    expect(badge.textContent).toBe('Active');
    expect(badge.className).toContain('badge');
    expect(badge.className).toContain('default');
    expect(badge.className).toContain('custom-badge');
    expect(ref.current).toBe(badge);
  });

  const variants: BadgeVariant[] = ['default', 'outline', 'gain', 'loss', 'accent'];

  variants.forEach((variant) => {
    it(`renders variant: ${variant}`, () => {
      render(
        <Badge variant={variant} data-testid={`badge-${variant}`}>
          {variant.toUpperCase()}
        </Badge>
      );

      const el = screen.getByTestId(`badge-${variant}`);
      expect(el.className).toContain(variant);
    });
  });
});
