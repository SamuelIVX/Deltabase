import { describe, it, expect } from "vitest";
import formatCurrency from "./formatCurrency";
import formatNumber from "./formatNumber";
import formatPercent from "./formatPercent";
import formatDate from "./formatDate";

describe("formatCurrency", () => {
    it("formats values with compact USD notation", () => {
        expect(formatCurrency(1000)).toBe("$1K");
        expect(formatCurrency(1500)).toBe("$1.5K");
    });

    it("returns N/A for falsy values", () => {
        expect(formatCurrency(0)).toBe("N/A");
        expect(formatCurrency(undefined as unknown as number)).toBe("N/A");
    });
});

describe("formatNumber", () => {
    it("formats values with compact notation", () => {
        expect(formatNumber(1000)).toBe("1K");
        expect(formatNumber(2500000)).toBe("2.5M");
    });

    it("returns N/A for falsy values", () => {
        expect(formatNumber(0)).toBe("N/A");
    });
});

describe("formatPercent", () => {
    it("formats a fraction as a percentage string", () => {
        expect(formatPercent(0.1234)).toBe("12.34%");
        expect(formatPercent(1)).toBe("100.00%");
        expect(formatPercent(-0.5)).toBe("-50.00%");
    });

    it("returns N/A for falsy values", () => {
        expect(formatPercent(0)).toBe("N/A");
    });
});

describe("formatDate", () => {
    it("formats a date in US medium style", () => {
        expect(formatDate("2026-01-15")).toMatch(/Jan 15, 2026/);
    });

    it("returns N/A for falsy values", () => {
        expect(formatDate("")).toBe("N/A");
    });
});
