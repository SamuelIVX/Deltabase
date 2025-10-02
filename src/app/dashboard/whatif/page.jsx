'use client';
import { useState } from 'react';
import { AssetContext } from '@/components/whatif/assetselector/assetselector';
import Blurb from "@/components/whatif/blurb/blurb";
import AssetSelector from "@/components/whatif/assetselector/assetselector";
import InvestmentForm from "@/components/whatif/investmentform/investmentform";
import ComparisonCharts from "../../../components/whatif/comparisoncharts/comparisoncharts";
import ComparisonSummary from "@/components/whatif/comparisonsummary/comparisonsummary";

const WhatIf = () => {
    // Asset 1 state
    const [selectedAsset1, setSelectedAsset1] = useState(null);
    const [value1, setValue1] = useState([1]);
    const [initialInvestment1, setInitialInvestment1] = useState("");
    const [monthlyInvestment1, setMonthlyInvestment1] = useState("");
    const [asset1Data, setAsset1Data] = useState([]);

    // Asset 2 state
    const [selectedAsset2, setSelectedAsset2] = useState(null);
    const [value2, setValue2] = useState([1]);
    const [initialInvestment2, setInitialInvestment2] = useState("");
    const [monthlyInvestment2, setMonthlyInvestment2] = useState("");
    const [asset2Data, setAsset2Data] = useState([]);

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
