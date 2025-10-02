'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../markets.module.css';
import { createContext, useContext } from 'react'
import useYahooBasicHistoricalData from '@/hooks/useYahooBasicHistoricalData';
import useYahooStockQuote from '@/hooks/useYahooStockQuote';
import useDebounce from '@/hooks/useDebounce';
import formatDate from '@/utils/formatDate';

export const MarketContext = createContext({
    selectedStock: "",
    setSelectedStock: (value: string) => { },
});

const StockMarketChart = () => {
    const { selectedStock, setSelectedStock } = useContext(MarketContext);
    const debouncedStock = useDebounce(selectedStock, 500);
    const { quote, isLoading, error } = useYahooStockQuote(debouncedStock);

    // Fetch historical data
    const { historicalData } = useYahooBasicHistoricalData(debouncedStock, '1y');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.title}>Currently Showing: </span>

                <span className={styles.search}>
                    <input
                        className={styles.input}
                        type='text'
                        placeholder="Enter a stock symbol..."
                        value={selectedStock || ''}
                        onChange={(e) => {
                            setSelectedStock(e.target.value)
                        }}
                    />
                </span>
            </div>

            {error && <p className={styles.error}>Error fetching stock data</p>}
            {isLoading && <p className={styles.loading}>Loading...</p>}

            {quote && !isLoading && (
                <div className={styles.stockInfo}>


                    {/* Regular Market */}
                    <div className={styles.priceSection}>
                        <span className={styles.price}>${quote.regularMarketPrice?.toFixed(2)}</span>
                        {' '}
                        {quote.regularMarketChangePercent !== undefined && (
                            <span style={{ color: quote.regularMarketChangePercent >= 0 ? '#10b981' : '#ef4444' }}>
                                {quote.regularMarketChangePercent >= 0 ? '+' : ''}
                                {quote.regularMarketChangePercent.toFixed(2)}%
                                {' '}
                                ({quote.regularMarketChangePercent >= 0 ? '+' : ''}
                                ${Math.abs(quote.regularMarketPrice * quote.regularMarketChangePercent / 100).toFixed(2)})
                                <span className={styles.timeLabel}> Today</span>
                            </span>
                        )}
                        {' '}
                    </div>

                    {/* Post Market - Only show if available */}
                    {quote.postMarketPrice && quote.postMarketChangePercent !== undefined && (
                        <div className={styles.priceSection}>
                            <span className={styles.afterHoursLabel}>After Hours:</span>
                            {' '}
                            <span className={styles.price}>${quote.postMarketPrice.toFixed(2)}</span>
                            {' '}
                            <span style={{ color: quote.postMarketChangePercent >= 0 ? '#10b981' : '#ef4444' }}>
                                {quote.postMarketChangePercent >= 0 ? '+' : ''}
                                {quote.postMarketChangePercent.toFixed(2)}%
                                {' '}
                                ({quote.postMarketChangePercent >= 0 ? '+' : ''}
                                ${Math.abs(quote.postMarketPrice * quote.postMarketChangePercent / 100).toFixed(2)})
                            </span>
                        </div>
                    )}

                    {quote.regularMarketTime && (
                        <div className={styles.marketTime}>
                            {formatDate(quote.regularMarketTime)} · {quote.currency}
                        </div>
                    )}

                </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    width={500}
                    height={300}
                    data={historicalData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <XAxis
                        dataKey="date"
                    />
                    <YAxis
                        domain={[
                            (dataMin) => (dataMin * 0.995),
                            (dataMax) => dataMax * 1.005,
                        ]}
                        tickFormatter={(value) => value.toFixed(2)}
                    />
                    <Tooltip />
                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke="rgba(51, 242, 121, 0.76)"
                        fill="rgba(61, 180, 63, 0.15)" />
                </AreaChart>
            </ResponsiveContainer>

        </div >
    );
};

export default StockMarketChart;