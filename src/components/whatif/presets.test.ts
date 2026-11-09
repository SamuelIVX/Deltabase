/**
 * Unit tests for What-If DCA comparison presets list.
 */
import { describe, it, expect } from "vitest";
import { COMPARISON_PRESETS } from "./presets";

describe("COMPARISON_PRESETS", () => {
    it("contains valid curated presets with paired assets and default DCA parameters", () => {
        expect(COMPARISON_PRESETS.length).toBeGreaterThan(0);

        COMPARISON_PRESETS.forEach((preset) => {
            expect(preset.id).toBeTruthy();
            expect(preset.label).toBeTruthy();
            expect(preset.asset1.symbol).toBeTruthy();
            expect(preset.asset2.symbol).toBeTruthy();
            expect(Number(preset.initialInvestment)).toBeGreaterThan(0);
            expect(Number(preset.monthlyInvestment)).toBeGreaterThan(0);
            expect(preset.years).toBeGreaterThan(0);
        });
    });

    it("includes popular benchmark comparisons", () => {
        const ids = COMPARISON_PRESETS.map((p) => p.id);
        expect(ids).toContain("spy-vs-qqq");
        expect(ids).toContain("btc-vs-eth");
    });
});
