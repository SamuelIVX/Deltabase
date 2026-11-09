import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';

describe('Card component suite', () => {
  it('renders Card with default variant and forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Card ref={ref} data-testid="test-card" className="custom-card">
        Card Body
      </Card>
    );

    const card = screen.getByTestId('test-card');
    expect(card).toBeDefined();
    expect(card.textContent).toBe('Card Body');
    expect(card.className).toContain('card');
    expect(card.className).toContain('custom-card');
    expect(ref.current).toBe(card);
  });

  it('renders interactive variant with elevated styles', () => {
    render(
      <Card variant="interactive" data-testid="interactive-card">
        Interactive Card
      </Card>
    );

    const card = screen.getByTestId('interactive-card');
    expect(card.className).toContain('interactive');
  });

  it('renders CardHeader, CardTitle, CardDescription, CardContent, and CardFooter', () => {
    const titleRef = React.createRef<HTMLHeadingElement>();
    render(
      <Card>
        <CardHeader data-testid="card-header">
          <CardTitle ref={titleRef} data-testid="card-title">
            Card Title Text
          </CardTitle>
          <CardDescription data-testid="card-desc">
            Card Description Text
          </CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content">
          <p>Main content area</p>
        </CardContent>
        <CardFooter data-testid="card-footer">
          <button type="button">Action</button>
        </CardFooter>
      </Card>
    );

    const header = screen.getByTestId('card-header');
    const title = screen.getByTestId('card-title');
    const desc = screen.getByTestId('card-desc');
    const content = screen.getByTestId('card-content');
    const footer = screen.getByTestId('card-footer');

    expect(header).toBeDefined();
    expect(title.textContent).toBe('Card Title Text');
    expect(titleRef.current).toBe(title);
    expect(desc.textContent).toBe('Card Description Text');
    expect(content.textContent).toBe('Main content area');
    expect(footer.querySelector('button')?.textContent).toBe('Action');
  });
});
