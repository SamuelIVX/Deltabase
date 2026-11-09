/**
 * Accessibility smoke tests (axe) for key dashboard / What-If surfaces.
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import TaxAdjustedReturns from "@/components/taxfreecalculator/taxfreecalculator";
import InvestmentForm from "@/components/whatif/investmentform/investmentform";
import AssetSelector from "@/components/whatif/assetselector/assetselector";
import ComparisonSummary from "@/components/whatif/comparisonsummary/comparisonsummary";
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

vi.mock("@/hooks/useYahooStockSymbols", () => ({
    default: () => ({ results: [], isLoading: false, error: null }),
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
});
