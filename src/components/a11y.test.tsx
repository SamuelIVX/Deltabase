/**
 * Accessibility smoke tests (axe) for key dashboard / What-If surfaces.
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import useYahooStockSymbols from "@/hooks/useYahooStockSymbols";
import TaxAdjustedReturns from "@/components/taxfeecalculator/taxfeecalculator";
import InvestmentForm from "@/components/whatif/investmentform/investmentform";
import AssetSelector from "@/components/whatif/assetselector/assetselector";
import ComparisonSummary from "@/components/whatif/comparisonsummary/comparisonsummary";
import ThemeToggle from "@/components/theme/ThemeToggle";
import MarketRibbon from "@/components/dashboard/marketribbon/MarketRibbon";
import Navbar from "@/components/dashboard/navbar/navbar";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import { SidebarProvider } from "@/components/dashboard/sidebar/SidebarContext";
import Rightbar from "@/components/dashboard/rightbar/rightbar";
import MacroCards from "@/components/dashboard/macro/MacroCards";
import MarketBenchmarkChart from "@/components/dashboard/macro/MarketBenchmarkChart";
import { AssetContext } from "@/components/whatif/assetselector/assetselector";

vi.mock("@/hooks/useDebounce", () => ({
    default: (value: string) => value,
}));

vi.mock("@/hooks/useYahooStockQuote", () => ({
    default: () => ({ quote: null, isLoading: false, error: null }),
}));

vi.mock("@/hooks/useCryptoLatestTick", () => ({
    default: () => ({ result: null, isLoading: false, error: null }),
}));

vi.mock("@/hooks/useFinnhubNews", () => ({
    default: () => ({
        data: [
            {
                id: "1",
                headline: "Axe test market headline",
                source: "Bloomberg",
                url: "https://bloomberg.com",
                datetime: 1731110000,
            },
        ],
        isPending: false,
        isError: false,
    }),
}));

vi.mock("@/hooks/useYahooStockSymbols", () => ({
    default: vi.fn(() => ({ results: [], isLoading: false, error: null })),
}));

vi.mock("@/hooks/useMarketIndices", () => {
    const mockHook = () => ({
        indices: [
            {
                symbol: "^GSPC",
                name: "S&P 500",
                price: 5864.67,
                change: 14.2,
                changePercent: 0.24,
                currency: "USD",
            },
        ],
        isLoading: false,
        error: null,
    });
    return {
        default: mockHook,
        useMarketIndices: mockHook,
    };
});

vi.mock("@/hooks/useYahooBasicHistoricalData", () => ({
    default: () => ({
        historicalData: [
            { date: "2024-01-01", close: 5000, volume: 100000 },
        ],
        isLoading: false,
        error: null,
    }),
}));

const contextValue = {
    selectedAsset1: null,
    setSelectedAsset1: () => {},
    value1: [5],
    setValue1: () => {},
    initialInvestment1: "",
    setInitialInvestment1: () => {},
    monthlyInvestment1: "",
    setMonthlyInvestment1: () => {},
    asset1Data: [],
    setAsset1Data: () => {},
    selectedAsset2: null,
    setSelectedAsset2: () => {},
    value2: [5],
    setValue2: () => {},
    initialInvestment2: "",
    setInitialInvestment2: () => {},
    monthlyInvestment2: "",
    setMonthlyInvestment2: () => {},
    asset2Data: [],
    setAsset2Data: () => {},
};

async function seriousViolations(container: HTMLElement) {
    const results = await axe.run(container);
    return results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
    );
}

describe("a11y", () => {
    it("tax calculator form has no critical or serious violations", async () => {
        const { container } = render(<TaxAdjustedReturns />);
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("what-if investment form has no critical or serious violations", async () => {
        const { container } = render(
            <AssetContext.Provider value={contextValue}>
                <InvestmentForm />
            </AssetContext.Provider>
        );
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("what-if asset selector has no critical or serious violations", async () => {
        const { container } = render(
            <AssetContext.Provider value={contextValue}>
                <AssetSelector />
            </AssetContext.Provider>
        );
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("what-if asset selector with search results listbox has no critical or serious violations", async () => {
        vi.mocked(useYahooStockSymbols).mockReturnValue({
            results: [
                { symbol: "AAPL", shortname: "Apple Inc." },
                { symbol: "MSFT", shortname: "Microsoft Corporation" },
            ] as never,
            isLoading: false,
            error: null,
        });
        const { container } = render(
            <AssetContext.Provider value={contextValue}>
                <AssetSelector />
            </AssetContext.Provider>
        );
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("what-if comparison summary has no critical or serious violations", async () => {
        const fullContext = {
            ...contextValue,
            selectedAsset1: { symbol: "AAPL", shortname: "Apple Inc." },
            selectedAsset2: { symbol: "MSFT", shortname: "Microsoft" },
            initialInvestment1: "1000",
            monthlyInvestment1: "100",
            initialInvestment2: "1000",
            monthlyInvestment2: "100",
            asset1Data: [{ name: "2024-01-01", portfolioValue: "1500.00" }],
            asset2Data: [{ name: "2024-01-01", portfolioValue: "1800.00" }],
        };
        const { container } = render(
            <AssetContext.Provider value={fullContext as never}>
                <ComparisonSummary />
            </AssetContext.Provider>
        );
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("theme toggle button has no critical or serious violations", async () => {
        const { container } = render(<ThemeToggle />);
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("navbar header has no critical or serious violations", async () => {
        const { container } = render(<Navbar />);
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("sidebar navigation has no critical or serious violations", async () => {
        const { container } = render(
            <SidebarProvider>
                <Sidebar />
            </SidebarProvider>
        );
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("market ribbon has no critical or serious violations", async () => {
        const { container } = render(<MarketRibbon />);
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("rightbar news feed has no critical or serious violations", async () => {
        const { container } = render(<Rightbar />);
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("macro cards have no critical or serious violations", async () => {
        const { container } = render(<MacroCards />);
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("market benchmark chart has no critical or serious violations", async () => {
        const { container } = render(<MarketBenchmarkChart />);
        expect(await seriousViolations(container)).toEqual([]);
    });
});
