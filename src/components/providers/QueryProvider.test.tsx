import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useQueryClient } from '@tanstack/react-query';
import QueryProvider from './QueryProvider';

function ConsumerComponent() {
    const client = useQueryClient();
    return <div>{client ? 'Client Initialized' : 'No Client'}</div>;
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

    it('provides QueryClient context to consumers', () => {
        render(
            <QueryProvider>
                <ConsumerComponent />
            </QueryProvider>
        );

        expect(screen.getByText('Client Initialized')).toBeInTheDocument();
    });
});
