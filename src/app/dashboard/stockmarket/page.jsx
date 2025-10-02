'use client'
import StockMarketChart from "@/components/markets/stockmarket/stockmarketchart";
import StockMarketMetrics from "@/components/markets/stockmarket/stockmarketmetrics";
import { MarketContext } from "@/components/markets/stockmarket/stockmarketchart";
import { useState } from "react";

const StockMarket = () => {
    const [selectedStock, setSelectedStock] = useState(null);

    return (
        <div>
            <MarketContext.Provider value={{ selectedStock, setSelectedStock }}>
                <StockMarketChart />
                <StockMarketMetrics />
            </MarketContext.Provider>
        </div>
    );
};

export default StockMarket;