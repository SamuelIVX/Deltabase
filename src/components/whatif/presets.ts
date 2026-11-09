/**
 * Curated 1-click popular DCA comparison presets for What-If simulator.
 */
import type { ComparisonPreset } from "@/types/whatif";

export const COMPARISON_PRESETS: ComparisonPreset[] = [
    {
        id: "spy-vs-qqq",
        label: "SPY vs QQQ",
        asset1: { symbol: "SPY", shortname: "SPDR S&P 500 ETF" },
        asset2: { symbol: "QQQ", shortname: "Invesco QQQ Trust" },
        initialInvestment: "1000",
        monthlyInvestment: "250",
        years: 5,
    },
    {
        id: "voo-vs-aapl",
        label: "VOO vs AAPL",
        asset1: { symbol: "VOO", shortname: "Vanguard S&P 500 ETF" },
        asset2: { symbol: "AAPL", shortname: "Apple Inc." },
        initialInvestment: "1000",
        monthlyInvestment: "250",
        years: 5,
    },
    {
        id: "btc-vs-eth",
        label: "BTC vs ETH",
        asset1: { symbol: "BTC-USD", shortname: "Bitcoin USD" },
        asset2: { symbol: "ETH-USD", shortname: "Ethereum USD" },
        initialInvestment: "1000",
        monthlyInvestment: "200",
        years: 3,
    },
    {
        id: "nvda-vs-tsla",
        label: "NVDA vs TSLA",
        asset1: { symbol: "NVDA", shortname: "NVIDIA Corporation" },
        asset2: { symbol: "TSLA", shortname: "Tesla, Inc." },
        initialInvestment: "1000",
        monthlyInvestment: "250",
        years: 5,
    },
    {
        id: "schd-vs-vti",
        label: "SCHD vs VTI",
        asset1: { symbol: "SCHD", shortname: "Schwab US Dividend Equity" },
        asset2: { symbol: "VTI", shortname: "Vanguard Total Stock Market" },
        initialInvestment: "1000",
        monthlyInvestment: "250",
        years: 5,
    },
];
