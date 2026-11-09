/**
 * Unit tests for What-If ComparisonCharts container component.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ComparisonCharts from "./comparisoncharts";
import { AssetContext } from "../assetselector/assetselector";

vi.mock("./UnifiedComparisonChart", () => ({
    default: () => <div data-testid="unified-chart">Unified Chart</div>,
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

describe("ComparisonCharts container component", () => {
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

    it("renders unified comparative chart when required fields are populated", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <ComparisonCharts />
            </AssetContext.Provider>
        );

        expect(screen.getByTestId("unified-chart")).toBeInTheDocument();
    });
});
