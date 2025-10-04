'use client'
import styles from '../markets.module.css';
import useCryptoHistoricalData from '@/hooks/useCryptoHistoricalData';

const CryptoMarketChart = () => {
    const { results, isLoading, error } = useCryptoHistoricalData({
        market: "kraken",
        instrument: "BTC-USD",
        limit: 30,
        aggregate: 1
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className={styles.chartWrapper}>
            {results.map(item => (
                <div key={item.timestamp}>
                    {new Date(item.timestamp * 1000).toISOString().split('T')[0]}: ${item.close.toFixed(2)}
                </div>
            ))}
        </div>
    );
};

export default CryptoMarketChart;
