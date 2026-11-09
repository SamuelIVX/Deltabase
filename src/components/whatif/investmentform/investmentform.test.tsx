/**
 * Comprehensive unit tests for What-If InvestmentForm component.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
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
    beforeEach(() => {
        vi.clearAllMocks();
    });

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

    it("synchronizes initial, monthly, and time parameters across both assets when linked", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <InvestmentForm />
            </AssetContext.Provider>
        );

        // Initial 1 changes both
        const init1 = screen.getByLabelText("Initial Investment for Asset 1");
        fireEvent.change(init1, { target: { value: "5000" } });
        expect(mockContext.setInitialInvestment1).toHaveBeenCalledWith("5000");
        expect(mockContext.setInitialInvestment2).toHaveBeenCalledWith("5000");

        // Monthly 1 changes both
        const monthly1 = screen.getByLabelText("Monthly Investment for Asset 1");
        fireEvent.change(monthly1, { target: { value: "500" } });
        expect(mockContext.setMonthlyInvestment1).toHaveBeenCalledWith("500");
        expect(mockContext.setMonthlyInvestment2).toHaveBeenCalledWith("500");

        // Initial 2 changes both
        const init2 = screen.getByLabelText("Initial Investment for Asset 2");
        fireEvent.change(init2, { target: { value: "6000" } });
        expect(mockContext.setInitialInvestment2).toHaveBeenCalledWith("6000");
        expect(mockContext.setInitialInvestment1).toHaveBeenCalledWith("6000");

        // Monthly 2 changes both
        const monthly2 = screen.getByLabelText("Monthly Investment for Asset 2");
        fireEvent.change(monthly2, { target: { value: "600" } });
        expect(mockContext.setMonthlyInvestment2).toHaveBeenCalledWith("600");
        expect(mockContext.setMonthlyInvestment1).toHaveBeenCalledWith("600");

        // Time button on Asset 1 changes both
        const threeYBtns = screen.getAllByRole("button", { name: "3Y" });
        fireEvent.click(threeYBtns[0]);
        expect(mockContext.setValue1).toHaveBeenCalledWith([3]);
        expect(mockContext.setValue2).toHaveBeenCalledWith([3]);

        // Time button on Asset 2 changes both
        fireEvent.click(threeYBtns[1]);
        expect(mockContext.setValue2).toHaveBeenCalledWith([3]);
        expect(mockContext.setValue1).toHaveBeenCalledWith([3]);
    });

    it("allows independent parameter editing when unlinked", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <InvestmentForm />
            </AssetContext.Provider>
        );

        const linkToggle = screen.getByRole("button", { name: /Equal Strategy/i });
        fireEvent.click(linkToggle);

        // Initial 1 only updates asset 1
        const init1 = screen.getByLabelText("Initial Investment for Asset 1");
        fireEvent.change(init1, { target: { value: "2500" } });
        expect(mockContext.setInitialInvestment1).toHaveBeenCalledWith("2500");
        expect(mockContext.setInitialInvestment2).not.toHaveBeenCalledWith("2500");

        // Monthly 1 only updates asset 1
        const monthly1 = screen.getByLabelText("Monthly Investment for Asset 1");
        fireEvent.change(monthly1, { target: { value: "150" } });
        expect(mockContext.setMonthlyInvestment1).toHaveBeenCalledWith("150");
        expect(mockContext.setMonthlyInvestment2).not.toHaveBeenCalledWith("150");

        // Initial 2 only updates asset 2
        const init2 = screen.getByLabelText("Initial Investment for Asset 2");
        fireEvent.change(init2, { target: { value: "7000" } });
        expect(mockContext.setInitialInvestment2).toHaveBeenCalledWith("7000");
        expect(mockContext.setInitialInvestment1).not.toHaveBeenCalledWith("7000");

        // Monthly 2 only updates asset 2
        const monthly2 = screen.getByLabelText("Monthly Investment for Asset 2");
        fireEvent.change(monthly2, { target: { value: "700" } });
        expect(mockContext.setMonthlyInvestment2).toHaveBeenCalledWith("700");
        expect(mockContext.setMonthlyInvestment1).not.toHaveBeenCalledWith("700");

        // Time buttons update independently
        const oneYBtns = screen.getAllByRole("button", { name: "1Y" });
        fireEvent.click(oneYBtns[0]);
        expect(mockContext.setValue1).toHaveBeenCalledWith([1]);
        expect(mockContext.setValue2).not.toHaveBeenCalledWith([1]);

        fireEvent.click(oneYBtns[1]);
        expect(mockContext.setValue2).toHaveBeenCalledWith([1]);
    });

    it("synchronizes Asset 2 values from Asset 1 upon re-linking", () => {
        render(
            <AssetContext.Provider value={mockContext}>
                <InvestmentForm />
            </AssetContext.Provider>
        );

        const linkToggle = screen.getByRole("button", { name: /Equal Strategy/i });
        // Unlink
        fireEvent.click(linkToggle);
        expect(linkToggle).toHaveAttribute("aria-pressed", "false");

        // Re-link
        fireEvent.click(linkToggle);
        expect(linkToggle).toHaveAttribute("aria-pressed", "true");
        expect(mockContext.setInitialInvestment2).toHaveBeenCalledWith(mockContext.initialInvestment1);
        expect(mockContext.setMonthlyInvestment2).toHaveBeenCalledWith(mockContext.monthlyInvestment1);
        expect(mockContext.setValue2).toHaveBeenCalledWith(mockContext.value1);
    });
});
