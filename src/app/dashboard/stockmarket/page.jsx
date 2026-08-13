'use client'
/**
 * Stock market page — chart + metrics for a selected Yahoo ticker.
 */
import StockMarketChart from "@/components/markets/stockmarket/stockmarketchart";
import StockMarketMetrics from "@/components/markets/stockmarket/stockmarketmetrics";
import { StockMarketContext } from "@/components/markets/stockmarket/stockmarketchart";
import { useState } from "react";

/**
 * Stock market view composing chart + metrics components.
 * @returns {JSX.Element}
 */
const StockMarket = () => {
    const [selectedStock, setSelectedStock] = useState(null);

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