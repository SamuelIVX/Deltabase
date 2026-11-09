'use client';
/**
 * Client-side React Query client provider wrapper.
 * Creates an isolated QueryClient per component tree instance to prevent cache collisions.
 */
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Wraps child components with an isolated TanStack QueryClient instance.
 * @param props.children - Child tree to provide with React Query.
 * @returns QueryClientProvider JSX shell.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
