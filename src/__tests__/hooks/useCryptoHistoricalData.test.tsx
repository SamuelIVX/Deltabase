import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useCryptoHistoricalData from '@/hooks/useCryptoHistoricalData';
import React from 'react';

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe('useCryptoHistoricalData', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns empty results and isLoading=false when market or instrument is missing', () => {
        const { result } = renderHook(
            () => useCryptoHistoricalData({ market: '', instrument: '' }),
            { wrapper: createWrapper() }
        );

        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('fetches and returns historical candles successfully', async () => {
        const mockCandles = [
            {
                date: '2026-11-08',
                time: '12:00 PM',
                timestamp: 1700000000,
                open: 50000,
                high: 51000,
                low: 49000,
                close: 50500,
                volume: 120,
            },
        ];

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => mockCandles,
        } as Response);

        const { result } = renderHook(
            () => useCryptoHistoricalData({ market: 'kraken', instrument: 'BTC-USD', range: '1mo' }),
            { wrapper: createWrapper() }
        );

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.results).toEqual(mockCandles);
        expect(result.current.error).toBeNull();
    });

    it('captures error message when fetch fails with API error', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Invalid instrument' }),
        } as Response);

        const { result } = renderHook(
            () => useCryptoHistoricalData({ market: 'kraken', instrument: 'INVALID' }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.error).toBe('Invalid instrument'));
        expect(result.current.results).toEqual([]);
    });

    it('captures error when response data is not an array', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ notAnArray: true }),
        } as Response);

        const { result } = renderHook(
            () => useCryptoHistoricalData({ market: 'kraken', instrument: 'BTC-USD' }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.error).toBe('Invalid API response format'));
    });
});
