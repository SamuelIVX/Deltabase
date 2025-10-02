import CryptoMarketChart from "@/components/markets/cryptomarket/cryptomarketchart";
import CryptoMarketMetrics from "@/components/markets/cryptomarket/cryptomarketmetrics";

const CryptoMarket = () => {
    return (
        <div>
            <h1> Crypto Market Page</h1>
            <CryptoMarketChart />
            <CryptoMarketMetrics />
        </div>
    );
};

export default CryptoMarket;