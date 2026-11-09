/**
 * Unit tests for UnifiedComparisonChart and CustomWhatIfTooltip components.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import UnifiedComparisonChart, { CustomWhatIfTooltip } from "./UnifiedComparisonChart";
import { AssetContext } from "../assetselector/assetselector";
import useYahooHistoricalData from "@/hooks/useYahooHistoricalData";

vi.mock("@/hooks/useYahooHistoricalData", () => ({
    default: vi.fn((symbol: string) => ({
        results: symbol
            ? [
                  { date: "2023-01-01", adjclose: 100 },
                  { date: "2023-02-01", adjclose: 110 },
              ]
            : [],
        isLoading: false,
        error: null,
    })),
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

describe("UnifiedComparisonChart component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders comparative chart header, legend, and baseline", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <UnifiedComparisonChart />
            </AssetContext.Provider>
        );

        expect(screen.getByText("Comparative DCA Portfolio Value")).toBeInTheDocument();
        expect(screen.getByText("Invested")).toBeInTheDocument();

        const focusSpyBtn = screen.getByRole("button", { name: "Focus SPY" });
        const focusQqqBtn = screen.getByRole("button", { name: "Focus QQQ" });
        expect(focusSpyBtn).toBeInTheDocument();
        expect(focusQqqBtn).toBeInTheDocument();

        // Focus and blur events
        fireEvent.mouseEnter(focusSpyBtn);
        fireEvent.mouseLeave(focusSpyBtn);
        fireEvent.focus(focusQqqBtn);
        fireEvent.blur(focusQqqBtn);

        expect(mockContext.setAsset1Data).toHaveBeenCalled();
        expect(mockContext.setAsset2Data).toHaveBeenCalled();
    });

    it("renders loading overlay when historical data is loading", () => {
        vi.mocked(useYahooHistoricalData).mockReturnValue({
            results: [],
            isLoading: true,
            error: null,
        });

        const { container } = render(
            <AssetContext.Provider value={mockContext}>
                <UnifiedComparisonChart />
            </AssetContext.Provider>
        );

        expect(container.querySelector('[class*="loadingOverlay"]')).toBeInTheDocument();
    });

    it("renders error message when historical data fails", () => {
        vi.mocked(useYahooHistoricalData).mockReturnValue({
            results: [],
            isLoading: false,
            error: "Yahoo upstream 429 rate limited",
        });

        render(
            <AssetContext.Provider value={mockContext}>
                <UnifiedComparisonChart />
            </AssetContext.Provider>
        );

        expect(
            screen.getByText(/Historical data error: Yahoo upstream 429 rate limited/i)
        ).toBeInTheDocument();
    });

    it("renders CustomWhatIfTooltip with values, percentage gains, and spread", () => {
        const { container: emptyContainer } = render(
            <CustomWhatIfTooltip active={false} />
        );
        expect(emptyContainer.firstChild).toBeNull();

        const payload = [
            {
                name: "SPY",
                value: 12500,
                payload: {
                    name: "2024-03-01",
                    displayDate: "2024-03",
                    portfolioValue1: 12500,
                    portfolioValue2: 15000,
                    invested: 10000,
                },
            },
        ];

        const { rerender } = render(
            <CustomWhatIfTooltip
                active={true}
                payload={payload}
                label="March 2024"
                asset1Symbol="SPY"
                asset2Symbol="QQQ"
            />
        );

        expect(screen.getByText("March 2024")).toBeInTheDocument();
        expect(screen.getByText("$12,500.00")).toBeInTheDocument();
        expect(screen.getByText("$15,000.00")).toBeInTheDocument();
        expect(screen.getByText("+25.0%")).toBeInTheDocument();
        expect(screen.getByText("+50.0%")).toBeInTheDocument();
        expect(screen.getByText("Invested Principal")).toBeInTheDocument();
        expect(screen.getByText(/QQQ leads by \$2,500\.00/i)).toBeInTheDocument();

        // Rerender with Asset 1 in the lead
        const payloadAsset1Lead = [
            {
                name: "SPY",
                value: 18000,
                payload: {
                    name: "2024-03-01",
                    displayDate: "2024-03",
                    portfolioValue1: 18000,
                    portfolioValue2: 15000,
                    invested: 10000,
                },
            },
        ];

        rerender(
            <CustomWhatIfTooltip
                active={true}
                payload={payloadAsset1Lead}
                label="March 2024"
                asset1Symbol="SPY"
                asset2Symbol="QQQ"
            />
        );

        expect(screen.getByText(/SPY leads by \$3,000\.00/i)).toBeInTheDocument();
    });
});
