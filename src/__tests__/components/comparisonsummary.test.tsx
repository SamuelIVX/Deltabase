/**
 * Unit tests for the ComparisonSummary component.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ComparisonSummary from "@/components/whatif/comparisonsummary/comparisonsummary";
import { AssetContext } from "@/components/whatif/assetselector/assetselector";

const baseContext = {
    selectedAsset1: null,
    setSelectedAsset1: () => {},
    value1: [1],
    setValue1: () => {},
    initialInvestment1: "",
    setInitialInvestment1: () => {},
    monthlyInvestment1: "",
    setMonthlyInvestment1: () => {},
    asset1Data: [],
    setAsset1Data: () => {},
    selectedAsset2: null,
    setSelectedAsset2: () => {},
    value2: [1],
    setValue2: () => {},
    initialInvestment2: "",
    setInitialInvestment2: () => {},
    monthlyInvestment2: "",
    setMonthlyInvestment2: () => {},
    asset2Data: [],
    setAsset2Data: () => {},
};

describe("ComparisonSummary component", () => {
    it("renders empty container when required fields are missing", () => {
        const { container } = render(
            <AssetContext.Provider value={baseContext}>
                <ComparisonSummary />
            </AssetContext.Provider>
        );
        expect(container.firstChild).toBeEmptyDOMElement();
    });

    it("renders formatted numbers and opportunity cost when comparison is populated", () => {
        const populatedContext = {
            ...baseContext,
            selectedAsset1: { symbol: "AAPL", shortname: "Apple Inc." },
            selectedAsset2: { symbol: "MSFT", shortname: "Microsoft Corp." },
            initialInvestment1: "5000",
            monthlyInvestment1: "250",
            initialInvestment2: "5000",
            monthlyInvestment2: "250",
            asset1Data: [{ name: "2024-01-01", portfolioValue: "12500.50" }],
            asset2Data: [{ name: "2024-01-01", portfolioValue: "16200.75" }],
        };

        render(
            <AssetContext.Provider value={populatedContext as never}>
                <ComparisonSummary />
            </AssetContext.Provider>
        );

        expect(screen.getByText("What-If Analysis Results")).toBeInTheDocument();
        expect(screen.getByText("$12,500.50")).toBeInTheDocument();
        expect(screen.getByText("$16,200.75")).toBeInTheDocument();
        expect(screen.getByText(/Cost you \$3,700.25/i)).toBeInTheDocument();
        expect(screen.getAllByText("MSFT").length).toBeGreaterThanOrEqual(1);
    });
});
