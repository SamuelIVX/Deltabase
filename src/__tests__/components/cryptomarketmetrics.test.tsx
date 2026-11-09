import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CryptoMarketMetrics from '@/components/markets/cryptomarket/cryptomarketmetrics';
import { CryptoMarketContext } from '@/components/markets/cryptomarket/cryptomarketchart';
import useCryptoLatestTick from '@/hooks/useCryptoLatestTick';

vi.mock('@/hooks/useCryptoLatestTick');

describe('CryptoMarketMetrics', () => {
    it('renders empty prompt when no result and not loading', () => {
        vi.mocked(useCryptoLatestTick).mockReturnValue({
            result: null,
            isLoading: false,
            error: undefined,
        } as unknown as ReturnType<typeof useCryptoLatestTick>);

        render(
            <CryptoMarketContext.Provider value={{ selectedCrypto: '', setSelectedCrypto: vi.fn() }}>
                <CryptoMarketMetrics />
            </CryptoMarketContext.Provider>
        );

        expect(screen.getByText('Please select a coin')).toBeInTheDocument();
    });

    it('renders loading state when isLoading is true', () => {
        vi.mocked(useCryptoLatestTick).mockReturnValue({
            result: null,
            isLoading: true,
            error: undefined,
        } as unknown as ReturnType<typeof useCryptoLatestTick>);

        render(
            <CryptoMarketContext.Provider value={{ selectedCrypto: 'BTC-USD', setSelectedCrypto: vi.fn() }}>
                <CryptoMarketMetrics />
            </CryptoMarketContext.Provider>
        );

        expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
    });

    it('renders error message when error exists', () => {
        vi.mocked(useCryptoLatestTick).mockReturnValue({
            result: null,
            isLoading: false,
            error: 'Failed to fetch',
        } as unknown as ReturnType<typeof useCryptoLatestTick>);

        render(
            <CryptoMarketContext.Provider value={{ selectedCrypto: 'BTC-USD', setSelectedCrypto: vi.fn() }}>
                <CryptoMarketMetrics />
            </CryptoMarketContext.Provider>
        );

        expect(screen.getByText('Error fetching crypto data')).toBeInTheDocument();
    });

    it('renders key metrics when result is returned', () => {
        vi.mocked(useCryptoLatestTick).mockReturnValue({
            result: {
                MARKET: 'kraken',
                CURRENT_DAY_LOW: 60000,
                CURRENT_DAY_HIGH: 64000,
                CURRENT_DAY_OPEN: 61000,
                CURRENT_DAY_QUOTE_VOLUME: 1500000,
                BEST_BID: 62500,
                BEST_ASK: 62510,
                CURRENT_YEAR_HIGH: 73000,
                CURRENT_YEAR_LOW: 40000,
                LIFETIME_HIGH: 75000,
            },
            isLoading: false,
            error: undefined,
        } as unknown as ReturnType<typeof useCryptoLatestTick>);

        render(
            <CryptoMarketContext.Provider value={{ selectedCrypto: 'BTC-USD', setSelectedCrypto: vi.fn() }}>
                <CryptoMarketMetrics />
            </CryptoMarketContext.Provider>
        );

        expect(screen.getByText('kraken')).toBeInTheDocument();
        expect(screen.getByText('Market')).toBeInTheDocument();
        expect(screen.getByText('Day Range')).toBeInTheDocument();
        expect(screen.getByText('$60K - $64K')).toBeInTheDocument();
        expect(screen.getByText('$61K')).toBeInTheDocument();
        expect(screen.getByText('$62.5K')).toBeInTheDocument();
        expect(screen.getByText('$75K')).toBeInTheDocument();
        expect(screen.getByText('$1.5M')).toBeInTheDocument();
    });

    it('displays volume formatted with non-USD quote currency', () => {
        vi.mocked(useCryptoLatestTick).mockReturnValue({
            result: {
                MARKET: 'kraken',
                QUOTE: 'EUR',
                CURRENT_DAY_QUOTE_VOLUME: 2500000,
            },
            isLoading: false,
            error: undefined,
        } as unknown as ReturnType<typeof useCryptoLatestTick>);

        render(
            <CryptoMarketContext.Provider value={{ selectedCrypto: 'ETH-EUR', setSelectedCrypto: vi.fn() }}>
                <CryptoMarketMetrics />
            </CryptoMarketContext.Provider>
        );

        expect(screen.getByText('2.5M EUR')).toBeInTheDocument();
    });
});
