'use client';
/**
 * What-If page — owns AssetContext state and composes the DCA comparison UI.
 * Cross-component investment/asset selections live in this page's context provider.
 */
import { useState } from 'react';
import { AssetContext } from '@/components/whatif/assetselector/assetselector';
import Blurb from "@/components/whatif/blurb/blurb";
import AssetSelector from "@/components/whatif/assetselector/assetselector";
import InvestmentForm from "@/components/whatif/investmentform/investmentform";
import ComparisonCharts from "@/components/whatif/comparisoncharts/comparisoncharts";
import ComparisonSummary from "@/components/whatif/comparisonsummary/comparisonsummary";
import type { AssetItem, MonthlyPortfolioPoint } from "@/types/whatif";

/**
 * What-If flagship page — holds investment/asset state in AssetContext and
 * composes selector, form, charts, and summary.
 * @returns {JSX.Element}
 */
const WhatIf = () => {
    // Default to SPY vs QQQ with 5-year lookback and $1,000 / $250 DCA
    const [selectedAsset1, setSelectedAsset1] = useState<AssetItem | null>({
        symbol: "SPY",
        shortname: "SPDR S&P 500 ETF Trust",
    });
    const [value1, setValue1] = useState<number[]>([5]);
    const [initialInvestment1, setInitialInvestment1] = useState<string>("1000");
    const [monthlyInvestment1, setMonthlyInvestment1] = useState<string>("250");
    const [asset1Data, setAsset1Data] = useState<MonthlyPortfolioPoint[]>([]);

    const [selectedAsset2, setSelectedAsset2] = useState<AssetItem | null>({
        symbol: "QQQ",
        shortname: "Invesco QQQ Trust",
    });
    const [value2, setValue2] = useState<number[]>([5]);
    const [initialInvestment2, setInitialInvestment2] = useState<string>("1000");
    const [monthlyInvestment2, setMonthlyInvestment2] = useState<string>("250");
    const [asset2Data, setAsset2Data] = useState<MonthlyPortfolioPoint[]>([]);

    return (
        <AssetContext.Provider
            value={{
                selectedAsset1, setSelectedAsset1,
                value1, setValue1,
                initialInvestment1, setInitialInvestment1,
                monthlyInvestment1, setMonthlyInvestment1,
                asset1Data, setAsset1Data,

                selectedAsset2, setSelectedAsset2,
                value2, setValue2,
                initialInvestment2, setInitialInvestment2,
                monthlyInvestment2, setMonthlyInvestment2,
                asset2Data, setAsset2Data
            }}
        >
            <Blurb />
            <AssetSelector />
            <InvestmentForm />
            <ComparisonCharts />
            <ComparisonSummary />
        </AssetContext.Provider>
    );
};

export default WhatIf;
