/**
 * Unit tests for What-If AssetSelector component and preset quick-picks.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import AssetSelector, { AssetContext } from "./assetselector";
import useYahooStockSymbols from "@/hooks/useYahooStockSymbols";

vi.mock("@/hooks/useDebounce", () => ({
    default: (val: string) => val,
}));

vi.mock("@/hooks/useYahooStockSymbols", () => ({
    default: vi.fn(() => ({ results: [], isLoading: false, error: null })),
}));

const mockContext = {
    selectedAsset1: null,
    setSelectedAsset1: vi.fn(),
    value1: [5],
    setValue1: vi.fn(),
    initialInvestment1: "1000",
    setInitialInvestment1: vi.fn(),
    monthlyInvestment1: "250",
    setMonthlyInvestment1: vi.fn(),
    asset1Data: [],
    setAsset1Data: vi.fn(),

    selectedAsset2: null,
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

describe("AssetSelector component", () => {
    it("renders popular comparison presets and applies a preset on click", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <AssetSelector />
            </AssetContext.Provider>
        );

        const spyVsQqqBtn = screen.getByRole("button", { name: "SPY vs QQQ" });
        expect(spyVsQqqBtn).toBeInTheDocument();

        fireEvent.click(spyVsQqqBtn);
        expect(mockContext.setSelectedAsset1).toHaveBeenCalledWith(
            expect.objectContaining({ symbol: "SPY" })
        );
        expect(mockContext.setSelectedAsset2).toHaveBeenCalledWith(
            expect.objectContaining({ symbol: "QQQ" })
        );
    });

    it("renders search inputs with accessible labels", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <AssetSelector />
            </AssetContext.Provider>
        );

        const input1 = screen.getByLabelText("Search symbol for Asset 1");
        const input2 = screen.getByLabelText("Search symbol for Asset 2");
        expect(input1).toBeInTheDocument();
        expect(input2).toBeInTheDocument();

        fireEvent.change(input1, { target: { value: "MSFT" } });
        expect((input1 as HTMLInputElement).value).toBe("MSFT");
    });

    it("displays dropdown results and selects an option on click and keydown", () => {
        vi.mocked(useYahooStockSymbols).mockReturnValue({
            results: [
                { symbol: "AAPL", shortname: "Apple Inc." },
                { symbol: "AMZN", shortname: "Amazon.com Inc." },
            ] as never,
            isLoading: false,
            error: null,
        });

        render(
            <AssetContext.Provider value={mockContext}>
                <AssetSelector />
            </AssetContext.Provider>
        );

        const listbox1 = screen.getByRole("listbox", { name: "Asset 1 results" });
        expect(listbox1).toBeInTheDocument();

        const appleOption = within(listbox1).getByText("AAPL");
        fireEvent.click(appleOption);
        expect(mockContext.setSelectedAsset1).toHaveBeenCalledWith(
            expect.objectContaining({ symbol: "AAPL" })
        );
    });

    it("renders selected badge and allows clearing via Change button", () => {
        const selectedContext = {
            ...mockContext,
            selectedAsset1: { symbol: "VOO", shortname: "Vanguard S&P 500 ETF" },
        };

        render(
            <AssetContext.Provider value={selectedContext}>
                <AssetSelector />
            </AssetContext.Provider>
        );

        expect(screen.getByText("VOO")).toBeInTheDocument();
        const changeBtn = screen.getByRole("button", { name: "Change Asset 1" });
        expect(changeBtn).toBeInTheDocument();

        fireEvent.click(changeBtn);
        expect(selectedContext.setSelectedAsset1).toHaveBeenCalledWith(null);
    });
});
