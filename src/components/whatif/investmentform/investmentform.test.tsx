/**
 * Unit tests for What-If InvestmentForm component.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import InvestmentForm from "./investmentform";
import { AssetContext } from "../assetselector/assetselector";

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

describe("InvestmentForm component", () => {
    it("renders investment input fields with accessible labels and initial values", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <InvestmentForm />
            </AssetContext.Provider>
        );

        const init1 = screen.getByLabelText("Initial Investment for Asset 1") as HTMLInputElement;
        const monthly1 = screen.getByLabelText("Monthly Investment for Asset 1") as HTMLInputElement;
        expect(init1.value).toBe("1000");
        expect(monthly1.value).toBe("250");
    });

    it("synchronizes investment parameters across both assets when linked", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <InvestmentForm />
            </AssetContext.Provider>
        );

        const init1 = screen.getByLabelText("Initial Investment for Asset 1");
        fireEvent.change(init1, { target: { value: "5000" } });

        expect(mockContext.setInitialInvestment1).toHaveBeenCalledWith("5000");
        expect(mockContext.setInitialInvestment2).toHaveBeenCalledWith("5000");
    });

    it("allows independent parameter editing when unlinked", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <InvestmentForm />
            </AssetContext.Provider>
        );

        const linkToggle = screen.getByRole("button", { name: /Equal Strategy/i });
        fireEvent.click(linkToggle);

        const init1 = screen.getByLabelText("Initial Investment for Asset 1");
        fireEvent.change(init1, { target: { value: "2500" } });

        expect(mockContext.setInitialInvestment1).toHaveBeenCalledWith("2500");
        expect(mockContext.setInitialInvestment2).not.toHaveBeenCalledWith("2500");
    });

    it("updates time horizon when clicking quick year pill buttons", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <InvestmentForm />
            </AssetContext.Provider>
        );

        const threeYBtns = screen.getAllByRole("button", { name: "3Y" });
        expect(threeYBtns.length).toBeGreaterThanOrEqual(1);

        fireEvent.click(threeYBtns[0]);
        expect(mockContext.setValue1).toHaveBeenCalledWith([3]);
    });
});
