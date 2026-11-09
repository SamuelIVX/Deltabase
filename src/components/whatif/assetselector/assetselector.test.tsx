/**
 * Comprehensive unit tests for What-If AssetSelector component and keyboard navigation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
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
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useYahooStockSymbols).mockReset();
        vi.mocked(useYahooStockSymbols).mockReturnValue({
            results: [
                { symbol: "AAPL", shortname: "Apple Inc." },
                { symbol: "MSFT", shortname: "Microsoft Corp." },
            ] as never,
            isLoading: false,
            error: null,
        });
    });

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
        expect(mockContext.setInitialInvestment1).toHaveBeenCalledWith("1000");
        expect(mockContext.setMonthlyInvestment1).toHaveBeenCalledWith("250");
        expect(mockContext.setValue1).toHaveBeenCalledWith([5]);
    });

    it("renders search inputs with accessible labels and handles input events", () => {
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

        fireEvent.change(input2, { target: { value: "GOOGL" } });
        expect((input2 as HTMLInputElement).value).toBe("GOOGL");
    });

    it("handles keyboard navigation and selection on Asset 1 dropdown options", () => {
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

        // Keyboard selection via Enter on option
        const amznOption = within(listbox1).getByText("AMZN");
        fireEvent.keyDown(amznOption, { key: "Enter" });
        expect(mockContext.setSelectedAsset1).toHaveBeenCalledWith(
            expect.objectContaining({ symbol: "AMZN" })
        );

        // Keyboard selection via Space on option
        fireEvent.keyDown(appleOption, { key: " " });
        expect(mockContext.setSelectedAsset1).toHaveBeenCalledWith(
            expect.objectContaining({ symbol: "AAPL" })
        );

        // Arrow navigation keys execute without throwing
        fireEvent.keyDown(appleOption, { key: "ArrowDown" });
        fireEvent.keyDown(appleOption, { key: "ArrowUp" });

        // Input Enter selects top result (AAPL)
        const input1 = screen.getByLabelText("Search symbol for Asset 1");
        fireEvent.keyDown(input1, { key: "Enter" });
        expect(mockContext.setSelectedAsset1).toHaveBeenCalledWith(
            expect.objectContaining({ symbol: "AAPL" })
        );

        // Input ArrowDown navigates to listbox
        fireEvent.keyDown(input1, { key: "ArrowDown" });
    });

    it("handles keyboard navigation and selection on Asset 2 dropdown options", () => {
        vi.mocked(useYahooStockSymbols).mockReturnValue({
            results: [
                { symbol: "NVDA", shortname: "Nvidia Corp." },
                { symbol: "TSLA", shortname: "Tesla Inc." },
            ] as never,
            isLoading: false,
            error: null,
        });

        render(
            <AssetContext.Provider value={mockContext}>
                <AssetSelector />
            </AssetContext.Provider>
        );

        const listbox2 = screen.getByRole("listbox", { name: "Asset 2 results" });
        expect(listbox2).toBeInTheDocument();

        const nvdaOption = within(listbox2).getByText("NVDA");
        fireEvent.click(nvdaOption);
        expect(mockContext.setSelectedAsset2).toHaveBeenCalledWith(
            expect.objectContaining({ symbol: "NVDA" })
        );

        // Keyboard selection via Enter on Asset 2 option
        const tslaOption = within(listbox2).getByText("TSLA");
        fireEvent.keyDown(tslaOption, { key: "Enter" });
        expect(mockContext.setSelectedAsset2).toHaveBeenCalledWith(
            expect.objectContaining({ symbol: "TSLA" })
        );

        // Keyboard selection via Space on Asset 2 option
        fireEvent.keyDown(nvdaOption, { key: " " });
        expect(mockContext.setSelectedAsset2).toHaveBeenCalledWith(
            expect.objectContaining({ symbol: "NVDA" })
        );

        // Arrow navigation
        fireEvent.keyDown(nvdaOption, { key: "ArrowDown" });
        fireEvent.keyDown(nvdaOption, { key: "ArrowUp" });

        // Input Enter on Asset 2 selects top result (NVDA)
        const input2 = screen.getByLabelText("Search symbol for Asset 2");
        fireEvent.keyDown(input2, { key: "Enter" });
        expect(mockContext.setSelectedAsset2).toHaveBeenCalledWith(
            expect.objectContaining({ symbol: "NVDA" })
        );

        // Input ArrowDown on input 2
        fireEvent.keyDown(input2, { key: "ArrowDown" });
    });

    it("renders selected badges and allows clearing via Change buttons", () => {
        const selectedContext = {
            ...mockContext,
            selectedAsset1: { symbol: "VOO", shortname: "Vanguard S&P 500 ETF" },
            selectedAsset2: { symbol: "QQQ", shortname: "Invesco QQQ Trust" },
        };

        render(
            <AssetContext.Provider value={selectedContext}>
                <AssetSelector />
            </AssetContext.Provider>
        );

        expect(screen.getByText("VOO")).toBeInTheDocument();
        expect(screen.getByText("QQQ")).toBeInTheDocument();

        const changeBtn1 = screen.getByRole("button", { name: "Change Asset 1" });
        const changeBtn2 = screen.getByRole("button", { name: "Change Asset 2" });

        fireEvent.click(changeBtn1);
        expect(selectedContext.setSelectedAsset1).toHaveBeenCalledWith(null);

        fireEvent.click(changeBtn2);
        expect(selectedContext.setSelectedAsset2).toHaveBeenCalledWith(null);
    });

    it("clears selection when search input text diverges from selected symbol", () => {
        const selectedContext = {
            ...mockContext,
            selectedAsset1: { symbol: "VOO", shortname: "Vanguard S&P 500 ETF" },
            selectedAsset2: { symbol: "QQQ", shortname: "Invesco QQQ Trust" },
        };

        render(
            <AssetContext.Provider value={selectedContext}>
                <AssetSelector />
            </AssetContext.Provider>
        );

        const input1 = screen.getByLabelText("Search symbol for Asset 1");
        const input2 = screen.getByLabelText("Search symbol for Asset 2");

        fireEvent.change(input1, { target: { value: "VOO-DIFF" } });
        expect(selectedContext.setSelectedAsset1).toHaveBeenCalledWith(null);

        fireEvent.change(input2, { target: { value: "QQQ-DIFF" } });
        expect(selectedContext.setSelectedAsset2).toHaveBeenCalledWith(null);
    });

    it("renders loading and error states for both assets", () => {
        vi.mocked(useYahooStockSymbols).mockReturnValue({
            results: [],
            isLoading: true,
            error: "Upstream rate limit",
        });

        render(
            <AssetContext.Provider value={mockContext}>
                <AssetSelector />
            </AssetContext.Provider>
        );

        const loadingTexts = screen.getAllByText("Searching market tickers...");
        expect(loadingTexts.length).toBe(2);

        const errorTexts = screen.getAllByText(/An error occurred: Upstream rate limit/i);
        expect(errorTexts.length).toBe(2);
    });
});
