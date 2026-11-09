/**
 * Component tests for the tax/fee adjusted-returns calculator form.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import TaxAdjustedReturns from "@/components/taxfeecalculator/taxfeecalculator";
import useYahooStockQuote from "@/hooks/useYahooStockQuote";
import useCryptoLatestTick from "@/hooks/useCryptoLatestTick";

vi.mock("@/hooks/useDebounce", () => ({
    default: (value: string) => value,
}));

vi.mock("@/hooks/useYahooStockQuote");
vi.mock("@/hooks/useCryptoLatestTick");

describe("TaxAdjustedReturns", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useYahooStockQuote).mockReturnValue({ quote: null, isLoading: false, error: null } as never);
        vi.mocked(useCryptoLatestTick).mockReturnValue({ result: null, isLoading: false, error: null } as never);
    });

    it("renders the title and market-type toggles", () => {
        render(<TaxAdjustedReturns />);
        expect(screen.getByRole("heading", { name: "Tax-Adjusted Returns" })).toBeInTheDocument();
        expect(screen.getByText(/Calculate your true net investment yield/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Stock" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Crypto" })).toBeInTheDocument();
    });

    it("initializes with Stock mode active by default to prevent blank white space", () => {
        render(<TaxAdjustedReturns />);
        expect(screen.getByRole("button", { name: "Stock" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "Crypto" })).toHaveAttribute("aria-pressed", "false");
        expect(screen.getByPlaceholderText("e.g. AAPL")).toBeInTheDocument();
        expect(screen.getByLabelText("Symbol")).toHaveValue("AAPL");
    });

    it("switches to crypto market when Crypto button is selected", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Crypto" }));
        expect(screen.getByRole("button", { name: "Crypto" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "Stock" })).toHaveAttribute("aria-pressed", "false");
        expect(screen.getByPlaceholderText("e.g. BTC-USD")).toBeInTheDocument();
        expect(screen.getByLabelText("Symbol")).toHaveValue("BTC-USD");
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

        const results = screen.getByRole("region", { name: "Calculation Results" });
        expect(within(results).getByText("$200.00")).toBeInTheDocument(); // Gross Profit
        expect(within(results).getByText("$22.00")).toBeInTheDocument();  // Fees
        expect(within(results).getByText("$35.60")).toBeInTheDocument();  // Tax
        expect(within(results).getByText("$142.40")).toBeInTheDocument(); // Net Profit
        expect(within(results).getByText("14.24%")).toBeInTheDocument();  // Net Return
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

        const results = screen.getByRole("region", { name: "Calculation Results" });
        expect(within(results).getByText("-$2,000.00")).toBeInTheDocument();
        expect(within(results).getByText("$490.00")).toBeInTheDocument();
        expect(within(results).getByText("$0.00")).toBeInTheDocument(); // Tax is 0 on loss
        expect(within(results).getByText("-$2,490.00")).toBeInTheDocument();
        expect(within(results).getByText("-4.98%")).toBeInTheDocument();
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

    it("supports custom cost basis and exit price inputs overriding quote values", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));

        fireEvent.change(screen.getByLabelText("Symbol"), { target: { value: "MSFT" } });
        fireEvent.change(screen.getByLabelText(/Cost Basis \/ Buy Price/i), { target: { value: "100" } });
        fireEvent.change(screen.getByLabelText(/Exit \/ Sell Price/i), { target: { value: "160" } });
        fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "5" } });
        fireEvent.change(screen.getByLabelText("Tax Rate (%)"), { target: { value: "15" } });
        fireEvent.change(screen.getByLabelText("Fee Rate (%)"), { target: { value: "1" } });

        // Math:
        // open = 100, current = 160, qty = 5
        // initialInvestment = 500.00
        // grossProfit = (160 - 100) * 5 = 300.00
        // feeCost = (100 + 160) * 5 * 1 / 100 = 13.00
        // taxableProfit = 300 - 13 = 287.00
        // taxAmount = 287 * 15 / 100 = 43.05
        // netProfit = 287 - 43.05 = 243.95
        // netReturn = (243.95 / 500) * 100 = 48.79%

        const results = screen.getByRole("region", { name: "Calculation Results" });
        expect(within(results).getByText("$300.00")).toBeInTheDocument();
        expect(within(results).getByText("$13.00")).toBeInTheDocument();
        expect(within(results).getByText("$43.05")).toBeInTheDocument();
        expect(within(results).getByText("$243.95")).toBeInTheDocument();
        expect(within(results).getByText("48.79%")).toBeInTheDocument();
    });

    it("restores user-typed tax rate when 0% None state preset is clicked", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));

        const taxInput = screen.getByLabelText("Tax Rate (%)");
        fireEvent.change(taxInput, { target: { value: "18.5" } });
        expect(taxInput).toHaveValue(18.5);

        // Add 6% Moderate state preset -> 18.5 + 6 = 24.5
        const state6Btn = screen.getByRole("button", { name: /\+6%/i });
        fireEvent.click(state6Btn);
        expect(taxInput).toHaveValue(24.5);

        // Click +0% None state preset -> restores 18.5
        const state0Btn = screen.getByRole("button", { name: /\+0%/i });
        fireEvent.click(state0Btn);
        expect(taxInput).toHaveValue(18.5);
    });

    it("autofills cost basis and exit price when Fetch Live Price is clicked", () => {
        vi.mocked(useYahooStockQuote).mockReturnValue({
            quote: {
                regularMarketOpen: 150,
                regularMarketPrice: 175,
            },
            isLoading: false,
            error: null,
        } as never);

        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));
        fireEvent.change(screen.getByLabelText("Symbol"), { target: { value: "AAPL" } });

        const fetchLiveBtn = screen.getByRole("button", { name: "Fetch Live Price" });
        expect(fetchLiveBtn).toBeEnabled();

        fireEvent.click(fetchLiveBtn);

        const costBasisInput = screen.getByLabelText(/Cost Basis \/ Buy Price/i) as HTMLInputElement;
        const exitPriceInput = screen.getByLabelText(/Exit \/ Sell Price/i) as HTMLInputElement;

        expect(costBasisInput.value).toBe("150");
        expect(exitPriceInput.value).toBe("175");
    });

    it("updates tax and fee rates using preset chips", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));

        // Switch to short-term holding period
        const shortTermBtn = screen.getByRole("button", { name: /Short-Term/i });
        fireEvent.click(shortTermBtn);

        const taxInput = screen.getByLabelText("Tax Rate (%)") as HTMLInputElement;
        expect(taxInput.value).toBe("24");

        // Click a specific bracket chip, e.g. 32%
        const bracket32Btn = screen.getByRole("button", { name: "32%" });
        fireEvent.click(bracket32Btn);
        expect(taxInput.value).toBe("32");

        // Click a fee preset chip
        const zeroCommissionBtn = screen.getByRole("button", { name: "Zero Commission" });
        fireEvent.click(zeroCommissionBtn);
        const feeInput = screen.getByLabelText("Fee Rate (%)") as HTMLInputElement;
        expect(feeInput.value).toBe("0");
    });

    it("applies state tax preset idempotently without stacking on repeated clicks", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));

        const stateBtn = screen.getByRole("button", { name: /\+9\.3%/i });
        fireEvent.click(stateBtn);
        // Default federal 15 + 9.3 = 24.3
        expect(screen.getByLabelText("Tax Rate (%)")).toHaveValue(24.3);

        // Click again: should remain 24.3 (not 33.6)
        fireEvent.click(stateBtn);
        expect(screen.getByLabelText("Tax Rate (%)")).toHaveValue(24.3);
    });

    it("displays error hint when stock quote fetch fails", () => {
        vi.mocked(useYahooStockQuote).mockReturnValue({
            quote: null,
            isLoading: false,
            error: "Failed to fetch stock quote",
        } as never);

        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));
        fireEvent.change(screen.getByLabelText("Symbol"), { target: { value: "INVALID" } });

        expect(screen.getByRole("alert")).toHaveTextContent("Failed to fetch stock quote");
    });

    it("displays error hint when crypto tick fetch fails", () => {
        vi.mocked(useCryptoLatestTick).mockReturnValue({
            result: null,
            isLoading: false,
            error: "Failed to fetch crypto tick",
        } as never);

        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Crypto" }));
        fireEvent.change(screen.getByLabelText("Symbol"), { target: { value: "INVALID-USD" } });

        expect(screen.getByRole("alert")).toHaveTextContent("Failed to fetch crypto tick");
    });

    it("updates active symbol when popular ticker chip is clicked", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));

        const nvdaChip = screen.getByRole("button", { name: "NVDA" });
        fireEvent.click(nvdaChip);

        const symbolInput = screen.getByLabelText("Symbol") as HTMLInputElement;
        expect(symbolInput.value).toBe("NVDA");
    });

    it("resets symbol to market default when toggling market type", () => {
        render(<TaxAdjustedReturns />);
        const stockBtn = screen.getByRole("button", { name: "Stock" });
        const cryptoBtn = screen.getByRole("button", { name: "Crypto" });

        fireEvent.click(stockBtn);
        const symbolInput = screen.getByLabelText("Symbol") as HTMLInputElement;
        expect(symbolInput.value).toBe("AAPL");
        expect(stockBtn).toHaveAttribute("aria-pressed", "true");
        expect(cryptoBtn).toHaveAttribute("aria-pressed", "false");

        // Switch to Crypto -> should reset to BTC-USD
        fireEvent.click(cryptoBtn);
        expect(symbolInput.value).toBe("BTC-USD");
        expect(cryptoBtn).toHaveAttribute("aria-pressed", "true");
        expect(stockBtn).toHaveAttribute("aria-pressed", "false");
    });

    it("preserves manually entered tax rate when toggling holding period", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));

        const taxInput = screen.getByLabelText("Tax Rate (%)");
        fireEvent.change(taxInput, { target: { value: "18.5" } });
        expect(taxInput).toHaveValue(18.5);

        // Toggle holding period to short-term -> manual rate 18.5 should be preserved, not overwritten with 24
        const shortTermBtn = screen.getByRole("button", { name: /Short-Term/i });
        fireEvent.click(shortTermBtn);
        expect(taxInput).toHaveValue(18.5);
    });

    it("clamps tax rate to 100 when entered rate exceeds 100", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));

        const taxInput = screen.getByLabelText("Tax Rate (%)");
        fireEvent.change(taxInput, { target: { value: "125" } });
        expect(taxInput).toHaveValue(100);
    });

    it("resets federalRate to 0 when tax rate input is cleared so subsequent state preset uses 0 basis", () => {
        render(<TaxAdjustedReturns />);
        fireEvent.click(screen.getByRole("button", { name: "Stock" }));

        const taxInput = screen.getByLabelText("Tax Rate (%)");
        // Clear the tax input
        fireEvent.change(taxInput, { target: { value: "" } });
        expect(taxInput).toHaveValue(null);

        // Click +6% Moderate state preset -> should be 0 + 6 = 6%, not stale 15 + 6 = 21%
        const modStateBtn = screen.getByRole("button", { name: /6% \(Moderate\)/i });
        fireEvent.click(modStateBtn);
        expect(taxInput).toHaveValue(6);
    });
});
