'use client'
import StockMarketChart from "@/components/markets/stockmarket/stockmarketchart";
import StockMarketMetrics from "@/components/markets/stockmarket/stockmarketmetrics";
import { StockMarketContext } from "@/components/markets/stockmarket/stockmarketchart";
import { useState } from "react";

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