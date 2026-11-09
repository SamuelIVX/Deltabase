/**
 * Unit tests for tax preset constants and structures (kills Stryker mutants).
 */
import { describe, it, expect } from "vitest";
import {
    SHORT_TERM_TAX_BRACKETS,
    LONG_TERM_TAX_BRACKETS,
    STATE_TAX_PRESETS,
    FEE_PRESETS,
} from "./tax";

describe("tax presets", () => {
    describe("SHORT_TERM_TAX_BRACKETS", () => {
        it("contains exact short-term federal tax brackets", () => {
            expect(SHORT_TERM_TAX_BRACKETS).toHaveLength(6);
            expect(SHORT_TERM_TAX_BRACKETS).toEqual([
                { label: "12%", rate: 12, description: "$11.6k – $47.1k" },
                { label: "22%", rate: 22, description: "$47.1k – $100.5k" },
                { label: "24%", rate: 24, description: "$100.5k – $191.9k" },
                { label: "32%", rate: 32, description: "$191.9k – $243.7k" },
                { label: "35%", rate: 35, description: "$243.7k – $609.3k" },
                { label: "37%", rate: 37, description: "Top Federal" },
            ]);
        });

        it("verifies individual bracket fields explicitly", () => {
            const rates = [12, 22, 24, 32, 35, 37];
            const labels = ["12%", "22%", "24%", "32%", "35%", "37%"];
            const descs = [
                "$11.6k – $47.1k",
                "$47.1k – $100.5k",
                "$100.5k – $191.9k",
                "$191.9k – $243.7k",
                "$243.7k – $609.3k",
                "Top Federal",
            ];

            SHORT_TERM_TAX_BRACKETS.forEach((preset, index) => {
                expect(preset.rate).toBe(rates[index]);
                expect(preset.label).toBe(labels[index]);
                expect(preset.description).toBe(descs[index]);
                expect(preset.name).toBeUndefined();
            });
        });
    });

    describe("LONG_TERM_TAX_BRACKETS", () => {
        it("contains exact long-term federal capital gains brackets", () => {
            expect(LONG_TERM_TAX_BRACKETS).toHaveLength(3);
            expect(LONG_TERM_TAX_BRACKETS).toEqual([
                { label: "0%", rate: 0, description: "Under $47k" },
                { label: "15%", rate: 15, description: "$47k – $518k (Standard)" },
                { label: "20%", rate: 20, description: "Top Long-Term" },
            ]);
        });

        it("verifies individual long-term bracket fields explicitly", () => {
            const rates = [0, 15, 20];
            const labels = ["0%", "15%", "20%"];
            const descs = ["Under $47k", "$47k – $518k (Standard)", "Top Long-Term"];

            LONG_TERM_TAX_BRACKETS.forEach((preset, index) => {
                expect(preset.rate).toBe(rates[index]);
                expect(preset.label).toBe(labels[index]);
                expect(preset.description).toBe(descs[index]);
                expect(preset.name).toBeUndefined();
            });
        });
    });

    describe("STATE_TAX_PRESETS", () => {
        it("contains exact state capital gains tax presets", () => {
            expect(STATE_TAX_PRESETS).toHaveLength(3);
            expect(STATE_TAX_PRESETS).toEqual([
                { label: "0%", name: "None", rate: 0, description: "FL, TX, WA, NV, WY, TN, SD, AK" },
                { label: "6%", name: "Moderate", rate: 6, description: "NY, IL, GA, NC" },
                { label: "9.3%", name: "High", rate: 9.3, description: "CA, NJ, HI" },
            ]);
        });

        it("verifies individual state preset fields explicitly", () => {
            const labels = ["0%", "6%", "9.3%"];
            const names = ["None", "Moderate", "High"];
            const rates = [0, 6, 9.3];
            const descs = [
                "FL, TX, WA, NV, WY, TN, SD, AK",
                "NY, IL, GA, NC",
                "CA, NJ, HI",
            ];

            STATE_TAX_PRESETS.forEach((preset, index) => {
                expect(preset.label).toBe(labels[index]);
                expect(preset.name).toBe(names[index]);
                expect(preset.rate).toBe(rates[index]);
                expect(preset.description).toBe(descs[index]);
            });
        });
    });

    describe("FEE_PRESETS", () => {
        it("contains exact exchange and brokerage fee presets", () => {
            expect(FEE_PRESETS).toHaveLength(5);
            expect(FEE_PRESETS).toEqual([
                { label: "Zero Commission", rate: 0, category: "stock" },
                { label: "0.10% Broker", rate: 0.1, category: "stock" },
                { label: "0.10% Binance", rate: 0.1, category: "crypto" },
                { label: "0.25% Kraken", rate: 0.25, category: "crypto" },
                { label: "0.60% Coinbase", rate: 0.6, category: "crypto" },
            ]);
        });

        it("verifies individual fee preset fields explicitly", () => {
            const labels = [
                "Zero Commission",
                "0.10% Broker",
                "0.10% Binance",
                "0.25% Kraken",
                "0.60% Coinbase",
            ];
            const rates = [0, 0.1, 0.1, 0.25, 0.6];
            const categories = ["stock", "stock", "crypto", "crypto", "crypto"];

            FEE_PRESETS.forEach((preset, index) => {
                expect(preset.label).toBe(labels[index]);
                expect(preset.rate).toBe(rates[index]);
                expect(preset.category).toBe(categories[index]);
            });
        });
    });
});
