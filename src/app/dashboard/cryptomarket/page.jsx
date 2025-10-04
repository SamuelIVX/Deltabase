'use client'
import { useState } from "react";
import CryptoMarketChart from "@/components/markets/cryptomarket/cryptomarketchart";
import CryptoMarketMetrics from "@/components/markets/cryptomarket/cryptomarketmetrics";
import { CryptoMarketContext } from "@/components/markets/cryptomarket/cryptomarketchart";

const CryptoMarket = () => {
    const [selectedCrypto, setSelectedCrypto] = useState(null);

    return (
        <div>
            <CryptoMarketContext.Provider value={{ selectedCrypto, setSelectedCrypto }}>
                <CryptoMarketChart />
                <CryptoMarketMetrics />
            </CryptoMarketContext.Provider>

        </div>
    );
};

export default CryptoMarket;