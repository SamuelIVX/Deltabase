'use client';
import { useState } from 'react';
import { AssetContext } from '@/components/whatif/assetselector/assetselector';
import Blurb from "@/components/whatif/blurb/blurb";
import AssetSelector from "@/components/whatif/assetselector/assetselector";
import InvestmentForm from "@/components/whatif/investmentform/investmentform";
import ComparisonCharts from "../../../components/whatif/comparisoncharts/comparisoncharts";
import ComparisonSummary from "@/components/whatif/comparisonsummary/comparisonsummary"; <ComparisonSummary />

const WhatIf = () => {
    const [selectedAsset1, setSelectedAsset1] = useState(null);
    const [selectedAsset2, setSelectedAsset2] = useState(null);
    const [value, setValue] = useState([1]);
    const [initialInvestment, setInitialInvestment] = useState("");
    const [monthlyInvestment, setMonthlyInvestment] = useState("");
    const [asset1Data, setAsset1Data] = useState([]);
    const [asset2Data, setAsset2Data] = useState([]);

    return (
        <div>
            <AssetContext.Provider value={{
                selectedAsset1,
                setSelectedAsset1,
                selectedAsset2,
                setSelectedAsset2,
                value,
                setValue,
                initialInvestment,
                setInitialInvestment,
                monthlyInvestment,
                setMonthlyInvestment,
                asset1Data,
                setAsset1Data,
                asset2Data,
                setAsset2Data
            }}>
                <Blurb />
                <AssetSelector />
                <InvestmentForm />
                <ComparisonCharts />
                <ComparisonSummary />
            </AssetContext.Provider>
        </div>
    )
}

export default WhatIf;