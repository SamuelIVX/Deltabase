import { describe, it, expect } from "vitest";
import { calculateTaxReturns } from "./calculateTaxReturns";

describe("calculateTaxReturns", () => {
    it("returns null for non-positive or non-finite prices and quantities", () => {
        expect(calculateTaxReturns({ openPrice: 0, currentPrice: 100, quantity: 1, taxRate: 15, feeRate: 0.5 })).toBeNull();
        expect(calculateTaxReturns({ openPrice: -10, currentPrice: 100, quantity: 1, taxRate: 15, feeRate: 0.5 })).toBeNull();
        expect(calculateTaxReturns({ openPrice: 100, currentPrice: 0, quantity: 1, taxRate: 15, feeRate: 0.5 })).toBeNull();
        expect(calculateTaxReturns({ openPrice: 100, currentPrice: -5, quantity: 1, taxRate: 15, feeRate: 0.5 })).toBeNull();
        expect(calculateTaxReturns({ openPrice: 100, currentPrice: 120, quantity: 0, taxRate: 15, feeRate: 0.5 })).toBeNull();
        expect(calculateTaxReturns({ openPrice: 100, currentPrice: 120, quantity: -2, taxRate: 15, feeRate: 0.5 })).toBeNull();
        expect(calculateTaxReturns({ openPrice: NaN, currentPrice: 120, quantity: 1, taxRate: 15, feeRate: 0.5 })).toBeNull();
        expect(calculateTaxReturns({ openPrice: 100, currentPrice: NaN, quantity: 1, taxRate: 15, feeRate: 0.5 })).toBeNull();
        expect(calculateTaxReturns({ openPrice: 100, currentPrice: 120, quantity: Infinity, taxRate: 15, feeRate: 0.5 })).toBeNull();
    });

    it("calculates gain scenario with taxes and fees accurately", () => {
        // open = 100, current = 120, qty = 10, taxRate = 20, feeRate = 1
        const result = calculateTaxReturns({
            openPrice: 100,
            currentPrice: 120,
            quantity: 10,
            taxRate: 20,
            feeRate: 1,
        });

        expect(result).not.toBeNull();
        expect(result?.grossProfit).toBe(200);
        expect(result?.feeCost).toBe(22);
        expect(result?.taxableProfit).toBe(178);
        expect(result?.taxAmount).toBe(35.6);
        expect(result?.netProfit).toBe(142.4);
        expect(result?.netReturn).toBe(14.24);
        expect(result?.initialInvestment).toBe(1000);
        expect(result?.totalExitValue).toBe(1142.4);
    });

    it("calculates loss scenario where taxable profit is <= 0 and tax is 0", () => {
        // open = 50000, current = 48000, qty = 1, taxRate = 15, feeRate = 0.5
        const result = calculateTaxReturns({
            openPrice: 50000,
            currentPrice: 48000,
            quantity: 1,
            taxRate: 15,
            feeRate: 0.5,
        });

        expect(result).not.toBeNull();
        expect(result?.grossProfit).toBe(-2000);
        expect(result?.feeCost).toBe(490);
        expect(result?.taxableProfit).toBe(-2490);
        expect(result?.taxAmount).toBe(0);
        expect(result?.netProfit).toBe(-2490);
        expect(result?.netReturn).toBeCloseTo(-4.98, 2);
    });

    it("defaults negative or non-finite tax and fee rates to 0", () => {
        const result = calculateTaxReturns({
            openPrice: 100,
            currentPrice: 150,
            quantity: 2,
            taxRate: -10,
            feeRate: -0.5,
        });

        expect(result).not.toBeNull();
        expect(result?.grossProfit).toBe(100);
        expect(result?.feeCost).toBe(0);
        expect(result?.taxableProfit).toBe(100);
        expect(result?.taxAmount).toBe(0);
        expect(result?.netProfit).toBe(100);
        expect(result?.netReturn).toBe(50);
    });

    it("handles non-finite tax and fee rate values gracefully", () => {
        const result = calculateTaxReturns({
            openPrice: 100,
            currentPrice: 110,
            quantity: 1,
            taxRate: NaN,
            feeRate: NaN,
        });

        expect(result).not.toBeNull();
        expect(result?.feeCost).toBe(0);
        expect(result?.taxAmount).toBe(0);
        expect(result?.netProfit).toBe(10);
        expect(result?.netReturn).toBe(10);
    });

    it("clamps tax and fee rates exceeding 100% to maximum of 100%", () => {
        const result = calculateTaxReturns({
            openPrice: 100,
            currentPrice: 200,
            quantity: 1,
            taxRate: 150,
            feeRate: 120,
        });

        expect(result).not.toBeNull();
        // feeRate clamped to 100%: (100 + 200) * 1 * 100 / 100 = 300
        expect(result?.feeCost).toBe(300);
        // grossProfit = 100, taxableProfit = 100 - 300 = -200
        expect(result?.taxableProfit).toBe(-200);
        expect(result?.taxAmount).toBe(0);

        // Test taxRate clamped to 100% when taxableProfit is positive
        const gainResult = calculateTaxReturns({
            openPrice: 100,
            currentPrice: 200,
            quantity: 1,
            taxRate: 150,
            feeRate: 0,
        });
        expect(gainResult?.feeCost).toBe(0);
        expect(gainResult?.taxableProfit).toBe(100);
        expect(gainResult?.taxAmount).toBe(100); // 100% of 100
        expect(gainResult?.netProfit).toBe(0);
    });
});
