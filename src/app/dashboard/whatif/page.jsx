import Blurb from "@/components/whatif/blurb/blurb";
import AssetSelector from "@/components/whatif/assetselector/assetselector";
import InvestmentForm from "@/components/whatif/investmentform/investmentform";

const WhatIf = () => {
    return (
        <div>
            <Blurb />
            <AssetSelector />
            <InvestmentForm />
        </div>
    )
}

export default WhatIf;