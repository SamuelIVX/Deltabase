import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from './Separator';

describe('Separator component suite', () => {
  it('renders default horizontal decorative separator', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Separator ref={ref} data-testid="test-separator" className="custom-sep" />
    );

    const el = screen.getByTestId('test-separator');
    expect(el).toBeDefined();
    expect(el.getAttribute('role')).toBe('none');
    expect(el.getAttribute('aria-orientation')).toBeNull();
    expect(el.className).toContain('separator');
    expect(el.className).toContain('horizontal');
    expect(el.className).toContain('custom-sep');
    expect(ref.current).toBe(el);
  });

  it('renders non-decorative horizontal separator with role="separator"', () => {
    render(<Separator decorative={false} data-testid="semantic-sep" />);

    const el = screen.getByTestId('semantic-sep');
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('renders vertical separator with proper orientation class and aria-orientation', () => {
    render(
      <Separator
        orientation="vertical"
        decorative={false}
        data-testid="vertical-sep"
      />
    );

    const el = screen.getByTestId('vertical-sep');
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
    expect(el.className).toContain('vertical');
  });
});
