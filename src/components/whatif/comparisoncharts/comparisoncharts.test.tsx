/**
 * Unit tests for What-If ComparisonCharts and UnifiedComparisonChart components.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ComparisonCharts from "./comparisoncharts";
import { AssetContext } from "../assetselector/assetselector";

vi.mock("@/hooks/useYahooHistoricalData", () => ({
    default: (symbol: string) => ({
        results: symbol
            ? [
                  { date: "2023-01-01", adjclose: 100 },
                  { date: "2023-02-01", adjclose: 110 },
              ]
            : [],
        isLoading: false,
        error: null,
    }),
}));

const mockContext = {
    selectedAsset1: { symbol: "SPY", shortname: "SPDR S&P 500" },
    setSelectedAsset1: vi.fn(),
    value1: [5],
    setValue1: vi.fn(),
    initialInvestment1: "1000",
    setInitialInvestment1: vi.fn(),
    monthlyInvestment1: "250",
    setMonthlyInvestment1: vi.fn(),
    asset1Data: [],
    setAsset1Data: vi.fn(),

    selectedAsset2: { symbol: "QQQ", shortname: "Invesco QQQ" },
    setSelectedAsset2: vi.fn(),
    value2: [5],
    setValue2: vi.fn(),
    initialInvestment2: "1000",
    setInitialInvestment2: vi.fn(),
    monthlyInvestment2: "250",
    setMonthlyInvestment2: vi.fn(),
    asset2Data: [],
    setAsset2Data: vi.fn(),
};

describe("ComparisonCharts component", () => {
    it("renders guidance message when required fields are unselected", () => {
        const incompleteContext = {
            ...mockContext,
            selectedAsset1: null,
        };

        render(
            <AssetContext.Provider value={incompleteContext}>
                <ComparisonCharts />
            </AssetContext.Provider>
        );

        expect(
            screen.getByText(/Please select both assets and enter initial & monthly investment amounts/i)
        ).toBeInTheDocument();
    });

    it("renders unified comparative chart header and interactive legend when populated", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <ComparisonCharts />
            </AssetContext.Provider>
        );

        expect(screen.getByText("Comparative DCA Portfolio Value")).toBeInTheDocument();
        const focusSpyBtn = screen.getByRole("button", { name: "Focus SPY" });
        const focusQqqBtn = screen.getByRole("button", { name: "Focus QQQ" });
        expect(focusSpyBtn).toBeInTheDocument();
        expect(focusQqqBtn).toBeInTheDocument();

        // Hovering legend item triggers active series state
        fireEvent.mouseEnter(focusSpyBtn);
        fireEvent.mouseLeave(focusSpyBtn);
    });
});
