/**
 * Unit tests for the StockMarketMetrics component.
 * Verifies safe rendering when range fields are undefined, null, or empty.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StockMarketMetrics from "@/components/markets/stockmarket/stockmarketmetrics";
import { StockMarketContext } from "@/components/markets/stockmarket/stockmarketchart";

let mockQuoteState = {
    quote: null as unknown,
    isLoading: false,
    error: null as string | null,
};

vi.mock("@/hooks/useYahooStockQuote", () => ({
    default: () => mockQuoteState,
}));

vi.mock("@/hooks/useDebounce", () => ({
    default: (val: string) => val,
}));

describe("StockMarketMetrics component", () => {
    it("renders please select a stock message when no quote is loaded", () => {
        mockQuoteState = { quote: null, isLoading: false, error: null };
        render(
            <StockMarketContext.Provider value={{ selectedStock: "", setSelectedStock: vi.fn() }}>
                <StockMarketMetrics />
            </StockMarketContext.Provider>
        );
        expect(screen.getByText(/Please select a stock/i)).toBeInTheDocument();
    });

    it("renders safely without throwing when dayRange or fiftyTwoWeekRange are undefined", () => {
        mockQuoteState = {
            quote: {
                symbol: "MUTUALFUND",
                marketCap: 1000000000,
                forwardPE: 15.2,
                trailingPE: 16.1,
                priceEpsCurrentYear: 5.4,
                dividendYield: 0.02,
                dividendRate: 1.5,
                dividendDate: "2024-05-01",
                regularMarketDayRange: undefined,
                fiftyTwoWeekRange: undefined,
            },
            isLoading: false,
            error: null,
        };

        expect(() =>
            render(
                <StockMarketContext.Provider value={{ selectedStock: "MUTUALFUND", setSelectedStock: vi.fn() }}>
                    <StockMarketMetrics />
                </StockMarketContext.Provider>
            )
        ).not.toThrow();

        expect(screen.getByText("Market Cap")).toBeInTheDocument();
        const naElements = screen.getAllByText("N/A");
        expect(naElements.length).toBeGreaterThanOrEqual(2);
    });

    it("renders day range and 52-week range when defined", () => {
        mockQuoteState = {
            quote: {
                symbol: "AAPL",
                marketCap: 3000000000000,
                regularMarketDayRange: { low: 180, high: 185 },
                fiftyTwoWeekRange: { low: 150, high: 195 },
                forwardPE: 28,
                trailingPE: 30,
                priceEpsCurrentYear: 6.5,
                dividendYield: 0.005,
                dividendRate: 0.96,
                dividendDate: "2024-02-15",
            },
            isLoading: false,
            error: null,
        };

        render(
            <StockMarketContext.Provider value={{ selectedStock: "AAPL", setSelectedStock: vi.fn() }}>
                <StockMarketMetrics />
            </StockMarketContext.Provider>
        );

        expect(screen.getByText("$180 - $185")).toBeInTheDocument();
        expect(screen.getByText("$150 - $195")).toBeInTheDocument();
        expect(screen.getByText("$0.96")).toBeInTheDocument();
    });
});
