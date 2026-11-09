"use client";
/**
 * Stock market page — chart + metrics for a selected Yahoo ticker.
 * Defaults to AAPL for an immediate live institutional overview.
 */
import React, { useState } from "react";
import StockMarketChart, { StockMarketContext } from "@/components/markets/stockmarket/stockmarketchart";
import StockMarketMetrics from "@/components/markets/stockmarket/stockmarketmetrics";

/**
 * Stock market view composing chart + metrics components.
 * @returns {JSX.Element} Stock market dashboard tab.
 */
const StockMarket = (): React.JSX.Element => {
    const [selectedStock, setSelectedStock] = useState<string>("AAPL");

    return (
        <div>
            <StockMarketContext.Provider value={{ selectedStock, setSelectedStock }}>
                <StockMarketChart />
                <StockMarketMetrics />
            </StockMarketContext.Provider>
        </div>
    );
};

export default StockMarket;
