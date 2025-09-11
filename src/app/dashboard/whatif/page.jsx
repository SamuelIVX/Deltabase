import Blurb from "@/components/whatif/blurb/blurb";
import AssetSelector from "@/components/whatif/assetselector/assetselector";
import InvestmentForm from "@/components/whatif/investmentform/investmentform";
import ComparisonCharts from "../../../components/whatif/comparisoncharts/comparisoncharts";

const WhatIf = () => {
    return (
        <div>
            <Blurb />
            <AssetSelector />
            <InvestmentForm />
            <ComparisonCharts />
        </div>
    )
}

export default WhatIf;