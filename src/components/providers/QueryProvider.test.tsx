import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useQueryClient } from '@tanstack/react-query';
import QueryProvider from './QueryProvider';

function ConsumerComponent() {
    const client = useQueryClient();
    const defaultOptions = client.getDefaultOptions().queries;
    return (
        <div>
            <span data-testid="stale-time">{String(defaultOptions?.staleTime)}</span>
            <span data-testid="refetch-focus">{String(defaultOptions?.refetchOnWindowFocus)}</span>
        </div>
    );
}

describe('QueryProvider', () => {
    it('renders children properly', () => {
        render(
            <QueryProvider>
                <div data-testid="child-element">Hello QueryProvider</div>
            </QueryProvider>
        );

        expect(screen.getByTestId('child-element')).toBeInTheDocument();
        expect(screen.getByText('Hello QueryProvider')).toBeInTheDocument();
    });

    it('provides QueryClient context with default options to consumers', () => {
        render(
            <QueryProvider>
                <ConsumerComponent />
            </QueryProvider>
        );

        expect(screen.getByTestId('stale-time').textContent).toBe('60000');
        expect(screen.getByTestId('refetch-focus').textContent).toBe('false');
    });
});
