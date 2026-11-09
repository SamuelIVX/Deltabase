/**
 * Unit tests for the StockMarketMetrics component and 52-Week RangeBar.
 * Verifies safe rendering when range fields are undefined, ETF expense ratio display,
 * and accessible meter attributes.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StockMarketMetrics, { RangeBar } from "@/components/markets/stockmarket/stockmarketmetrics";
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

describe("RangeBar component", () => {
    it("returns null when low, high, or inverted range is provided", () => {
        const { container: c1 } = render(<RangeBar label="52W" low={undefined} high={100} current={50} />);
        expect(c1).toBeEmptyDOMElement();

        const { container: c2 } = render(<RangeBar label="52W" low={100} high={50} current={75} />);
        expect(c2).toBeEmptyDOMElement();
    });

    it("renders meter element with accessible attributes and clamped values", () => {
        render(<RangeBar label="52-Week Range" low={100} high={200} current={150} />);
        const meter = screen.getByRole("meter", { name: "52-Week Range" });
        expect(meter).toHaveAttribute("aria-valuemin", "100");
        expect(meter).toHaveAttribute("aria-valuemax", "200");
        expect(meter).toHaveAttribute("aria-valuenow", "150");
        expect(screen.getByText("Current: $150")).toBeInTheDocument();
        expect(screen.getByText("$100")).toBeInTheDocument();
        expect(screen.getByText("$200")).toBeInTheDocument();
    });
});

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
                regularMarketPrice: 182.5,
                regularMarketDayRange: { low: 180, high: 185 },
                fiftyTwoWeekRange: { low: 150, high: 195 },
                forwardPE: 28,
                trailingPE: 30,
                beta: 1.24,
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
        expect(screen.getByText("Equity")).toBeInTheDocument();
        expect(screen.getByText("1.24")).toBeInTheDocument();
    });

    it("renders ETF badge and Expense Ratio when quote is an ETF", () => {
        mockQuoteState = {
            quote: {
                symbol: "SPY",
                quoteType: "ETF",
                netExpenseRatio: 0.0945,
                regularMarketPrice: 500,
                marketCap: 500000000000,
                fiftyTwoWeekLow: 400,
                fiftyTwoWeekHigh: 520,
                trailingPE: 24.5,
                dividendYield: 0.013,
            },
            isLoading: false,
            error: null,
        };

        render(
            <StockMarketContext.Provider value={{ selectedStock: "SPY", setSelectedStock: vi.fn() }}>
                <StockMarketMetrics />
            </StockMarketContext.Provider>
        );

        expect(screen.getByText("ETF")).toBeInTheDocument();
        expect(screen.getByText("Expense Ratio")).toBeInTheDocument();
        expect(screen.getByText("0.09%")).toBeInTheDocument();
        expect(screen.queryByText("Forward P/E")).not.toBeInTheDocument();
    });
});
