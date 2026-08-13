/**
 * Component tests for the tax/fee adjusted-returns calculator form.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TaxAdjustedReturns from "@/components/taxfreecalculator/taxfreecalculator";

vi.mock("@/hooks/useDebounce", () => ({
    default: (value: string) => value,
}));

vi.mock("@/hooks/useYahooStockQuote", () => ({
    default: () => ({ quote: null, isLoading: false, error: null }),
}));

vi.mock("@/hooks/useCryptoLatestTick", () => ({
    default: () => ({ result: null, isLoading: false, error: null }),
}));

describe("TaxFreeCalculator", () => {
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
});
