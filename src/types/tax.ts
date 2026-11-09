/**
 * Type definitions for tax- and fee-adjusted returns calculator and breakdown chart.
 */

/** Input parameters for calculating tax- and fee-adjusted investment returns. */
export interface TaxReturnsInput {
    openPrice: number;
    currentPrice: number;
    quantity: number;
    taxRate: number; // percentage (e.g. 15 for 15%)
    feeRate: number; // percentage (e.g. 0.5 for 0.5%)
}

/** Complete accounting breakdown of investment returns including taxes and fees. */
export interface TaxReturnsBreakdown {
    initialInvestment: number;
    grossProfit: number;
    feeCost: number;
    taxableProfit: number;
    taxAmount: number;
    netProfit: number;
    netReturn: number; // percentage return on initial investment
    totalExitValue: number;
}

/** Preset capital gains tax bracket button definition. */
export interface TaxBracketPreset {
    label: string;
    rate: number;
    description: string;
    name?: string;
}

/** Preset exchange or brokerage fee button definition. */
export interface FeePreset {
    label: string;
    rate: number;
    category: 'crypto' | 'stock' | 'both';
}

/** Federal short-term capital gains (ordinary income) bracket presets. */
export const SHORT_TERM_TAX_BRACKETS: TaxBracketPreset[] = [
    { label: '12%', rate: 12, description: '$11.6k – $47.1k' },
    { label: '22%', rate: 22, description: '$47.1k – $100.5k' },
    { label: '24%', rate: 24, description: '$100.5k – $191.9k' },
    { label: '32%', rate: 32, description: '$191.9k – $243.7k' },
    { label: '35%', rate: 35, description: '$243.7k – $609.3k' },
    { label: '37%', rate: 37, description: 'Top Federal' },
];

/** Federal long-term capital gains bracket presets. */
export const LONG_TERM_TAX_BRACKETS: TaxBracketPreset[] = [
    { label: '0%', rate: 0, description: 'Under $47k' },
    { label: '15%', rate: 15, description: '$47k – $518k (Standard)' },
    { label: '20%', rate: 20, description: 'Top Long-Term' },
];

/** State capital gains tax presets with distinct rate labels and names. */
export const STATE_TAX_PRESETS: TaxBracketPreset[] = [
    { label: '0%', name: 'None', rate: 0, description: 'FL, TX, WA, NV, WY, TN, SD, AK' },
    { label: '6%', name: 'Moderate', rate: 6, description: 'NY, IL, GA, NC' },
    { label: '9.3%', name: 'High', rate: 9.3, description: 'CA, NJ, HI' },
];

/** Brokerage and exchange transaction fee presets. */
export const FEE_PRESETS: FeePreset[] = [
    { label: 'Zero Commission', rate: 0, category: 'stock' },
    { label: '0.10% Broker', rate: 0.1, category: 'stock' },
    { label: '0.10% Binance', rate: 0.1, category: 'crypto' },
    { label: '0.25% Kraken', rate: 0.25, category: 'crypto' },
    { label: '0.60% Coinbase', rate: 0.6, category: 'crypto' },
];

