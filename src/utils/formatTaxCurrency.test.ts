/**
 * Tests for shared currency and tax rate formatting helpers.
 */
import { describe, it, expect } from "vitest";
import { formatTaxCurrency, formatTaxRate } from "./formatTaxCurrency";

describe("formatTaxCurrency", () => {
    it("formats positive amounts with thousands separators and 2 decimal places", () => {
        expect(formatTaxCurrency(1234.56)).toBe("$1,234.56");
        expect(formatTaxCurrency(0)).toBe("$0.00");
        expect(formatTaxCurrency(5)).toBe("$5.00");
    });

    it("formats negative amounts placing minus sign before the dollar symbol", () => {
        expect(formatTaxCurrency(-2000)).toBe("-$2,000.00");
        expect(formatTaxCurrency(-14.2)).toBe("-$14.20");
    });

    it("displays negative values that round to zero as $0.00 without minus sign", () => {
        expect(formatTaxCurrency(-0.001)).toBe("$0.00");
    });

    it("handles non-finite numbers safely returning $0.00", () => {
        expect(formatTaxCurrency(NaN)).toBe("$0.00");
        expect(formatTaxCurrency(Infinity)).toBe("$0.00");
        expect(formatTaxCurrency(-Infinity)).toBe("$0.00");
    });
});

describe("formatTaxRate", () => {
    it("formats whole integers without decimal points", () => {
        expect(formatTaxRate(15)).toBe("15");
        expect(formatTaxRate(0)).toBe("0");
    });

    it("preserves up to two decimal places without trailing zeroes", () => {
        expect(formatTaxRate(24.3)).toBe("24.3");
        expect(formatTaxRate(24.35)).toBe("24.35");
        expect(formatTaxRate(24.356)).toBe("24.36");
    });

    it("handles non-finite numbers safely returning 0", () => {
        expect(formatTaxRate(NaN)).toBe("0");
        expect(formatTaxRate(Infinity)).toBe("0");
        expect(formatTaxRate(-Infinity)).toBe("0");
    });
});
