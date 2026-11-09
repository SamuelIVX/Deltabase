import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CryptoMarketChart, { CryptoMarketContext } from '@/components/markets/cryptomarket/cryptomarketchart';
import StockMarketChart, { StockMarketContext } from '@/components/markets/stockmarket/stockmarketchart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

vi.mock('@/hooks/useCryptoHistoricalData', () => ({
    default: () => ({ results: [], isLoading: false, error: null }),
}));

vi.mock('@/hooks/useYahooHistoricalData', () => ({
    default: () => ({ results: [], isLoading: false, error: null }),
}));

vi.mock('@/components/markets/cryptomarket/cryptomarketmetrics', () => ({
    default: () => <div data-testid="crypto-metrics">Crypto Metrics</div>,
}));

vi.mock('@/components/markets/stockmarket/stockmarketmetrics', () => ({
    default: () => <div data-testid="stock-metrics">Stock Metrics</div>,
}));

function CryptoStatefulWrapper() {
    const [selectedCrypto, setSelectedCrypto] = useState('BTC-USD');
    return (
        <CryptoMarketContext.Provider value={{ selectedCrypto, setSelectedCrypto }}>
            <CryptoMarketChart />
        </CryptoMarketContext.Provider>
    );
}

function StockStatefulWrapper() {
    const [selectedStock, setSelectedStock] = useState('AAPL');
    return (
        <StockMarketContext.Provider value={{ selectedStock, setSelectedStock }}>
            <StockMarketChart />
        </StockMarketContext.Provider>
    );
}

function renderWithClient(ui: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Market Charts Input', () => {
    it('initializes and updates crypto input and placeholder', () => {
        renderWithClient(<CryptoStatefulWrapper />);
        const input = screen.getByLabelText('Enter a crypto pair') as HTMLInputElement;
        expect(input).toBeInTheDocument();
        expect(input.placeholder).toBe('Enter a crypto pair (e.g. BTC-USD)...');
        expect(input.value).toBe('BTC-USD');

        fireEvent.change(input, { target: { value: 'eth-usd' } });
        expect(input.value).toBe('ETH-USD');

        const solPill = screen.getByRole('button', { name: 'SOL' });
        fireEvent.click(solPill);
        expect(input.value).toBe('SOL-USD');
    });

    it('initializes and updates stock input and placeholder with quick chips', () => {
        renderWithClient(<StockStatefulWrapper />);
        const input = screen.getByLabelText('Enter a stock symbol') as HTMLInputElement;
        expect(input).toBeInTheDocument();
        expect(input.placeholder).toBe('Enter a stock symbol (e.g. AAPL)...');
        expect(input.value).toBe('AAPL');

        fireEvent.change(input, { target: { value: 'MSFT' } });
        expect(input.value).toBe('MSFT');

        const nvdaPill = screen.getByRole('button', { name: 'NVDA' });
        fireEvent.click(nvdaPill);
        expect(input.value).toBe('NVDA');
    });
});
