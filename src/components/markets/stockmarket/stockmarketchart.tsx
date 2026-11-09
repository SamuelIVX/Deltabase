'use client'
/**
 * Stock market price chart — range toggles, Recharts series, and StockMarketContext.
 */
import styles from '../markets.module.css';
import { useState } from 'react';
import { MoonLoader } from 'react-spinners';
import { TooltipProps } from 'recharts';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { createContext, useContext } from 'react'
import useYahooBasicHistoricalData from '@/hooks/useYahooBasicHistoricalData';
import useYahooStockQuote from '@/hooks/useYahooStockQuote';
import { YahooQuote } from '@/types/stock';
import useDebounce from '@/hooks/useDebounce';
import { SymbolDataPoint } from '@/types/dataPoints';
import formatNumber from '@/utils/formatNumber';
import formatDate from '@/utils/formatDate';

interface StockMarketContextType {
    selectedStock: string;
    setSelectedStock: (value: string) => void;
}

const POPULAR_STOCKS = [
    { label: "SPY", symbol: "SPY" },
    { label: "QQQ", symbol: "QQQ" },
    { label: "AAPL", symbol: "AAPL" },
    { label: "MSFT", symbol: "MSFT" },
    { label: "NVDA", symbol: "NVDA" },
    { label: "TSLA", symbol: "TSLA" },
    { label: "VXUS", symbol: "VXUS" },
];

/**
 * Shared stock chart selection context (symbol + range).
 * Provided by the stock market page; consumed by chart + metrics.
 */
export const StockMarketContext = createContext<StockMarketContextType>({
    selectedStock: "",
    setSelectedStock: () => { },
});

const StockTooltip: React.FC<
    TooltipProps<number, string> & { payload?: { payload: SymbolDataPoint }[] }> = ({ active, payload }) => {
        if (!active || !payload || payload.length === 0) return null;

        const { date, time, close, volume } = payload[0].payload;

        return (
            <div className={styles.customTooltip}>
                <p className={styles.description}>Date</p>
                <span className={styles.date}>{formatDate(date)}</span>
                {time && <span className={styles.time}> {time}</span>}
                {close != null && (
                    <>
                        <p className={styles.description}>Price</p>
                        <p className={styles.price}>${formatNumber(close)}</p>
                    </>
                )}
                <p className={styles.description}>Volume</p>
                <p className={styles.volume}>{formatNumber(volume)}</p>
            </div>
        );
    };

/**
 * Interactive stock price chart with range controls (Yahoo history via hooks).
 * @returns The chart panel including symbol input and range toggles.
 * @example
 * <StockMarketChart />
 */
const StockMarketChart = () => {
    const { selectedStock, setSelectedStock } = useContext(StockMarketContext);
    const debouncedStock = useDebounce(selectedStock, 500);
    const { quote, isLoading, error } = useYahooStockQuote(debouncedStock) as {
        quote: YahooQuote | null;
        isLoading: boolean;
        error: string | null;
    };
    // Fetch historical data
    const [selectedRange, setSelectedRange] = useState('1d');

    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
    };

    const {
        historicalData,
        isLoading: isHistoricalLoading,
        isFetching: isHistoricalFetching,
        isPlaceholderData,
        error: historicalError,
    } = useYahooBasicHistoricalData(debouncedStock, selectedRange);
    const isChartStale = Boolean(isPlaceholderData || isHistoricalFetching);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.searchRow}>
                    <span className={styles.title}>Ticker:</span>
                    <span className={styles.search}>
                        <input
                            className={styles.input}
                            type='text'
                            placeholder="Enter a stock symbol (e.g. AAPL)..."
                            aria-label="Enter a stock symbol"
                            value={selectedStock || ''}
                            onChange={(e) => {
                                setSelectedStock(e.target.value.trim().toUpperCase())
                            }}
                        />
                    </span>
                </div>

                <div className={styles.quickPills} role="group" aria-label="Popular stock tickers">
                    <span className={styles.pillLabel}>Popular:</span>
                    {POPULAR_STOCKS.map((stock) => {
                        const isActive = selectedStock?.trim().toUpperCase() === stock.symbol;
                        return (
                            <button
                                key={stock.symbol}
                                type="button"
                                aria-pressed={isActive}
                                className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                                onClick={() => setSelectedStock(stock.symbol)}
                            >
                                {stock.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {error && <p className={styles.message}>Error: {error}</p>}
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <MoonLoader color="var(--accent, #3b82f6)" size={64} />
                </div>
            )}

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
                            <span className={styles.price}>${quote.postMarketPrice.toFixed(2)}</span>
                            {' '}
                            <span style={{ color: quote.postMarketChangePercent >= 0 ? '#10b981' : '#ef4444' }}>
                                {quote.postMarketChangePercent >= 0 ? '+' : ''}
                                {quote.postMarketChangePercent.toFixed(2)}%
                                {' '}
                                ({quote.postMarketChangePercent >= 0 ? '+' : ''}
                                ${Math.abs(quote.postMarketPrice * quote.postMarketChangePercent / 100).toFixed(2)})
                                <span className={styles.afterHoursLabel}> After Hours</span>
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

            <div className={styles.chartArea}>
                {historicalData && historicalData.length > 0 ? (
                    <>
                        <div style={{ width: '100%', height: '100%', opacity: isChartStale ? 0.45 : 1, transition: 'opacity 0.2s ease' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    width={500}
                                    height={300}
                                    data={historicalData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent, #38bdf8)" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="var(--accent, #38bdf8)" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: "var(--textSoft)", fontSize: 11 }}
                                        stroke="var(--border-light, #334155)"
                                    />
                                    <YAxis
                                        domain={[
                                            (dataMin) => (dataMin * 0.995),
                                            (dataMax) => dataMax * 1.005,
                                        ]}
                                        tickFormatter={(value) => value.toFixed(2)}
                                        tick={{ fill: "var(--textSoft)", fontSize: 11 }}
                                        stroke="var(--border-light, #334155)"
                                    />
                                    <Tooltip content={<StockTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="close"
                                        stroke="var(--accent, #38bdf8)"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#stockGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        {isChartStale && (
                            <div className={styles.chartLoading}>
                                <MoonLoader color="var(--primary)" size={48} />
                            </div>
                        )}
                    </>
                ) : isHistoricalLoading ? (
                    <div className={styles.chartLoading}>
                        <MoonLoader color="var(--primary)" size={48} />
                    </div>
                ) : historicalError ? (
                    <div className={styles.chartMessage}>
                        Failed to load historical chart data: {historicalError}
                    </div>
                ) : (
                    <div className={styles.chartMessage}>
                        No historical chart data available.
                    </div>
                )}
            </div>

            <hr style={{ border: '1px solid var(--border)' }} />

            <div className={styles.dateRangeButtons}>
                {['1d', '5d', '1m', '3m', '6m', '1y', '5y'].map((range) => (
                    <button
                        key={range}
                        type="button"
                        className={`${styles.dateButton} ${selectedRange === range ? styles.selected : ''}`}
                        onClick={() => handleRangeChange(range)}
                    >
                        {range.toUpperCase()}
                    </button>
                ))}
            </div>

        </div >
    );
};

export default StockMarketChart;
