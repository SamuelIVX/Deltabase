import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import TaxAdjustedReturns from "@/components/taxfreecalculator/taxfreecalculator";
import InvestmentForm from "@/components/whatif/investmentform/investmentform";
import { AssetContext } from "@/components/whatif/assetselector/assetselector";

vi.mock("@/hooks/useDebounce", () => ({
    default: (value: string) => value,
}));

vi.mock("@/hooks/useYahooStockQuote", () => ({
    default: () => ({ quote: null, isLoading: false, error: null }),
}));

vi.mock("@/hooks/useCryptoLatestTick", () => ({
    default: () => ({ result: null, isLoading: false, error: null }),
}));

const contextValue = {
    selectedAsset1: null,
    setSelectedAsset1: () => {},
    value1: [5],
    setValue1: () => {},
    initialInvestment1: "",
    setInitialInvestment1: () => {},
    monthlyInvestment1: "",
    setMonthlyInvestment1: () => {},
    asset1Data: [],
    setAsset1Data: () => {},
    selectedAsset2: null,
    setSelectedAsset2: () => {},
    value2: [5],
    setValue2: () => {},
    initialInvestment2: "",
    setInitialInvestment2: () => {},
    monthlyInvestment2: "",
    setMonthlyInvestment2: () => {},
    asset2Data: [],
    setAsset2Data: () => {},
};

async function seriousViolations(container: HTMLElement) {
    const results = await axe.run(container, {
        rules: {
            "color-contrast": { enabled: false },
        },
    });
    return results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
    );
}

describe("a11y", () => {
    it("tax calculator form has no critical or serious violations", async () => {
        const { container } = render(<TaxAdjustedReturns />);
        expect(await seriousViolations(container)).toEqual([]);
    });

    it("what-if investment form has no critical or serious violations", async () => {
        const { container } = render(
            <AssetContext.Provider value={contextValue}>
                <InvestmentForm />
            </AssetContext.Provider>
        );
        expect(await seriousViolations(container)).toEqual([]);
    });
});
