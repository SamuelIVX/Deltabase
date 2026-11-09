/**
 * Component tests for the tax/fee adjusted-returns calculator form.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TaxAdjustedReturns from "@/components/taxfreecalculator/taxfreecalculator";
import useYahooStockQuote from "@/hooks/useYahooStockQuote";
import useCryptoLatestTick from "@/hooks/useCryptoLatestTick";

vi.mock("@/hooks/useDebounce", () => ({
    default: (value: string) => value,
}));

vi.mock("@/hooks/useYahooStockQuote");
vi.mock("@/hooks/useCryptoLatestTick");

describe("TaxFreeCalculator", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useYahooStockQuote).mockReturnValue({ quote: null, isLoading: false, error: null } as never);
        vi.mocked(useCryptoLatestTick).mockReturnValue({ result: null, isLoading: false, error: null } as never);
    });

    it("renders the title and market-type toggles", () => {
        render(<TaxAdjustedReturns />);
        expect(screen.getByRole("heading", { name: "Tax-Adjusted Returns" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Stock" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Crypto" })).toBeInTheDocument();
    });

    it("does not show the symbol form until a market type is chosen", () => {
        render(<TaxAdjustedReturns />);
        expect(screen.queryByPlaceholderText("e.g. AAPL")).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText("e.g. BTC-USD")).not.toBeInTheDocument();
    });

    it("reveals the stock symbol input after selecting Stock", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));
        expect(screen.getByPlaceholderText("e.g. AAPL")).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("e.g. BTC-USD")).not.toBeInTheDocument();
    });

    it("reveals the crypto symbol input after selecting Crypto", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Crypto" }));
        expect(screen.getByPlaceholderText("e.g. BTC-USD")).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("e.g. AAPL")).not.toBeInTheDocument();
    });

    it("computes and displays stock returns breakdown accurately", () => {
        vi.mocked(useYahooStockQuote).mockReturnValue({
            quote: {
                regularMarketOpen: 100,
                regularMarketPrice: 120,
            },
            isLoading: false,
            error: null,
        } as never);

        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));

        // Fill inputs: symbol=AAPL, quantity=10, taxRate=20, feeRate=1
        fireEvent.change(screen.getByLabelText("Symbol"), { target: { value: "AAPL" } });
        fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "10" } });
        fireEvent.change(screen.getByLabelText("Tax Rate (%)"), { target: { value: "20" } });
        fireEvent.change(screen.getByLabelText("Fee Rate (%)"), { target: { value: "1" } });

        // Math:
        // open = 100, price = 120, qty = 10
        // grossProfit = (120 - 100) * 10 = 200.00
        // feeCost = (100 + 120) * 10 * 1 / 100 = 22.00
        // taxableProfit = 200 - 22 = 178.00
        // taxAmount = 178 * 20 / 100 = 35.60
        // netProfit = 178 - 35.60 = 142.40
        // netReturn = (142.40 / 1000) * 100 = 14.24%

        expect(screen.getByRole("heading", { name: "Results" })).toBeInTheDocument();
        expect(screen.getByText("$200.00")).toBeInTheDocument(); // Gross Profit
        expect(screen.getByText("$22.00")).toBeInTheDocument();  // Fees
        expect(screen.getByText("$35.60")).toBeInTheDocument();  // Tax
        expect(screen.getByText("$142.40")).toBeInTheDocument(); // Net Profit
        expect(screen.getByText("14.24%")).toBeInTheDocument();  // Net Return
    });

    it("computes crypto returns breakdown with negative net profit when price drops", () => {
        vi.mocked(useCryptoLatestTick).mockReturnValue({
            result: {
                CURRENT_DAY_OPEN: 50000,
                PRICE: 48000,
            },
            isLoading: false,
            error: null,
        } as never);

        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Crypto" }));

        fireEvent.change(screen.getByLabelText("Symbol"), { target: { value: "BTC-USD" } });
        fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "1" } });
        fireEvent.change(screen.getByLabelText("Tax Rate (%)"), { target: { value: "15" } });
        fireEvent.change(screen.getByLabelText("Fee Rate (%)"), { target: { value: "0.5" } });

        // Math:
        // open = 50000, price = 48000, qty = 1
        // grossProfit = (48000 - 50000) * 1 = -2000.00
        // feeCost = (50000 + 48000) * 1 * 0.5 / 100 = 490.00
        // taxableProfit = -2000 - 490 = -2490.00
        // taxAmount = 0 (since taxableProfit <= 0)
        // netProfit = -2490.00
        // netReturn = (-2490 / 50000) * 100 = -4.98%

        expect(screen.getByRole("heading", { name: "Results" })).toBeInTheDocument();
        expect(screen.getByText("$-2000.00")).toBeInTheDocument();
        expect(screen.getByText("$490.00")).toBeInTheDocument();
        expect(screen.getByText("$0.00")).toBeInTheDocument(); // Tax is 0 on loss
        expect(screen.getByText("$-2490.00")).toBeInTheDocument();
        expect(screen.getByText("-4.98%")).toBeInTheDocument();
    });

    it("shows helper hint when symbol is provided but quantity is zero or invalid", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));

        fireEvent.change(screen.getByLabelText("Symbol"), { target: { value: "AAPL" } });
        fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "0" } });

        expect(screen.getByText("Please enter a quantity greater than 0 to calculate returns.")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Results" })).not.toBeInTheDocument();
    });

    it("does not render results if stock quote prices are missing or zero", () => {
        vi.mocked(useYahooStockQuote).mockReturnValue({
            quote: {
                regularMarketOpen: 0,
                regularMarketPrice: 0,
            },
            isLoading: false,
            error: null,
        } as never);

        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));
        fireEvent.change(screen.getByLabelText("Symbol"), { target: { value: "AAPL" } });

        expect(screen.queryByRole("heading", { name: "Results" })).not.toBeInTheDocument();
    });

    it("does not render results if crypto prices are missing or zero", () => {
        vi.mocked(useCryptoLatestTick).mockReturnValue({
            result: {
                CURRENT_DAY_OPEN: 0,
                PRICE: 0,
            },
            isLoading: false,
            error: null,
        } as never);

        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Crypto" }));
        fireEvent.change(screen.getByLabelText("Symbol"), { target: { value: "BTC-USD" } });

        expect(screen.queryByRole("heading", { name: "Results" })).not.toBeInTheDocument();
    });
});
