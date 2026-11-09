'use client'
/**
 * Crypto market page — chart + metrics for a selected spot instrument.
 */
import { useState } from "react";
import CryptoMarketChart from "@/components/markets/cryptomarket/cryptomarketchart";
import CryptoMarketMetrics from "@/components/markets/cryptomarket/cryptomarketmetrics";
import { CryptoMarketContext } from "@/components/markets/cryptomarket/cryptomarketchart";

/**
 * Crypto market view composing chart + metrics components.
 * Defaults to BTC-USD for an immediate live institutional overview.
 * @returns {JSX.Element}
 */
const CryptoMarket = () => {
    const [selectedCrypto, setSelectedCrypto] = useState("BTC-USD");

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
