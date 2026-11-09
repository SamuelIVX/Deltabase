"use client";
/**
 * Crypto market page — chart + metrics for a selected spot instrument.
 */
import React, { useState } from "react";
import CryptoMarketChart, { CryptoMarketContext } from "@/components/markets/cryptomarket/cryptomarketchart";
import CryptoMarketMetrics from "@/components/markets/cryptomarket/cryptomarketmetrics";

/**
 * Crypto market view composing chart + metrics components.
 * Defaults to BTC-USD for an immediate live institutional overview.
 * @returns {JSX.Element} Crypto market dashboard tab.
 */
const CryptoMarket = (): React.JSX.Element => {
    const [selectedCrypto, setSelectedCrypto] = useState<string>("BTC-USD");

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
