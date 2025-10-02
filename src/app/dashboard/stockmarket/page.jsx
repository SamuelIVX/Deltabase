import StockMarketChart from "@/components/markets/stockmarket/stockmarketchart";
import StockMarketMetrics from "@/components/markets/stockmarket/stockmarketmetrics";


const StockMarket = () => {
    return (
        <div>
            <h1> Stock Market Page</h1>
            <StockMarketMetrics />
            <StockMarketChart />
        </div>
    );
};

export default StockMarket;