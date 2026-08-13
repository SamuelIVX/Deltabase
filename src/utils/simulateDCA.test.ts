/**
 * Unit tests for the pure {@link simulateDCA} dollar-cost-averaging math.
 */
import { describe, it, expect } from "vitest";
import { simulateDCA, type DCAResultItem } from "./simulateDCA";

function priceRow(date: string, adjclose: string | number): DCAResultItem {
    return { date, adjclose };
}

describe("simulateDCA", () => {
    it("buys shares at each monthly price and compounds the portfolio", () => {
        // $100/mo at prices 100, 100, 100 -> 3 shares, $300 invested, value $300
        const results = [
            priceRow("2026-01-01", 100),
            priceRow("2026-02-01", 100),
            priceRow("2026-03-01", 100),
        ];
        const out = simulateDCA(results, 0, 100);
        expect(out.totalShares).toBeCloseTo(3, 10);
        expect(out.totalInvested).toBe(300);
        expect(out.finalValue).toBeCloseTo(300, 10);
        expect(out.gain).toBeCloseTo(0, 10);
    });

    it("applies the initial investment once at the first price point", () => {
        const results = [
            priceRow("2026-01-01", 50),
            priceRow("2026-02-01", 50),
        ];
        // $200 initial + $0 monthly at $50 -> 4 shares, $200 invested
        const out = simulateDCA(results, 200, 0);
        expect(out.totalShares).toBeCloseTo(4, 10);
        expect(out.totalInvested).toBe(200);
        expect(out.monthlyPortfolio).toHaveLength(2);
    });

    it("skips invalid and zero prices without breaking accumulation", () => {
        const results = [
            priceRow("2026-01-01", "invalid"),
            priceRow("2026-02-01", 0),
            priceRow("2026-03-01", 100),
        ];
        const out = simulateDCA(results, 0, 100);
        expect(out.totalInvested).toBe(100); // only the valid month invests
        expect(out.monthlyPortfolio).toHaveLength(1);
    });

    it("tracks gain when the final price moves", () => {
        const results = [
            priceRow("2026-01-01", 100),
            priceRow("2026-02-01", 200),
        ];
        const out = simulateDCA(results, 0, 100);
        // 1 share at $100 + 0.5 shares at $200 = 1.5 shares; invested $200
        expect(out.totalShares).toBeCloseTo(1.5, 10);
        expect(out.totalInvested).toBe(200);
        // final value = 1.5 * 200 = 300
        expect(out.finalValue).toBeCloseTo(300, 10);
        expect(out.gain).toBeCloseTo(100, 10);
    });

    it("applies the initial investment at the first valid price", () => {
        const results = [
            priceRow("2026-01-01", "invalid"),
            priceRow("2026-02-01", 0),
            priceRow("2026-03-01", 50),
        ];
        // $100 initial at $50 -> 2 shares, $100 invested, final value 2*50=100
        const out = simulateDCA(results, 100, 0);
        expect(out.totalShares).toBeCloseTo(2, 10);
        expect(out.totalInvested).toBe(100);
        expect(out.finalValue).toBeCloseTo(100, 10);
    });

    it("uses the last valid price for finalValue, ignoring trailing bad rows", () => {
        const results = [
            priceRow("2026-01-01", 100),
            priceRow("2026-02-01", 200),
            priceRow("2026-03-01", 0),
            priceRow("2026-04-01", "invalid"),
        ];
        // 1 share @100 + 0.5 shares @200 = 1.5 shares; invested $200
        const out = simulateDCA(results, 0, 100);
        expect(out.totalShares).toBeCloseTo(1.5, 10);
        // final value uses last valid price (200): 1.5 * 200 = 300
        expect(out.finalValue).toBeCloseTo(300, 10);
        expect(out.gain).toBeCloseTo(100, 10);
    });

    it("returns an empty portfolio for an empty result set", () => {
        const out = simulateDCA([], 100, 100);
        expect(out.monthlyPortfolio).toEqual([]);
        expect(out.totalInvested).toBe(0);
        expect(out.finalValue).toBe(0);
        expect(out.gain).toBe(0);
    });

    it("names months by their date slice", () => {
        const results = [priceRow("2026-01-15T00:00:00Z", 100)];
        const out = simulateDCA(results, 0, 100);
        expect(out.monthlyPortfolio[0].name).toBe("2026-01-15");
    });
});
