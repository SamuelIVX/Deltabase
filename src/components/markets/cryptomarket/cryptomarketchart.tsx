'use client'
/**
 * Crypto market price chart — range toggles, Recharts series, and CryptoMarketContext.
 */
import styles from '../markets.module.css';
import { useState } from 'react';
import { MoonLoader } from 'react-spinners';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { createContext, useContext } from 'react'
import useCryptoHistoricalData from '@/hooks/useCryptoHistoricalData';
import useCryptoLatestTick from '@/hooks/useCryptoLatestTick';
import useDebounce from '@/hooks/useDebounce';
import { SymbolDataPoint } from '@/types/dataPoints';
import formatNumber from '@/utils/formatNumber';
import formatDate from '@/utils/formatDate';
import { normalizeCryptoSymbol } from '@/utils/normalizeCryptoSymbol';

interface CryptoMarketContextType {
    selectedCrypto: string;
    setSelectedCrypto: (value: string) => void;
}

const POPULAR_CRYPTOS = [
    { label: "BTC", pair: "BTC-USD" },
    { label: "ETH", pair: "ETH-USD" },
    { label: "SOL", pair: "SOL-USD" },
    { label: "DOGE", pair: "DOGE-USD" },
    { label: "XRP", pair: "XRP-USD" },
    { label: "ADA", pair: "ADA-USD" },
];

/**
 * Shared price-formatting helper adjusting decimal precision based on price magnitude.
 * @param value - Price in USD to format.
 * @returns Formatted localized price string.
 */
export function formatCryptoPrice(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return "N/A";
    let maxDigits = 2;
    if (value < 0.001) {
        maxDigits = 6;
    } else if (value < 1) {
        maxDigits = 4;
    } else if (value < 10) {
        maxDigits = 3;
    }

    return value.toLocaleString("en-US", {
        minimumFractionDigits: value >= 10 ? 2 : Math.min(2, maxDigits),
        maximumFractionDigits: maxDigits,
    });
}

/**
 * Shared crypto chart selection context (instrument + range).
 * Provided by the crypto market page; consumed by chart + metrics.
 */
export const CryptoMarketContext = createContext<CryptoMarketContextType>({
    selectedCrypto: "BTC-USD",
    setSelectedCrypto: () => { },
});

const CryptoTooltip: React.FC<
    TooltipProps<number, string> & { payload?: { payload: SymbolDataPoint }[] }> = ({ active, payload }) => {
        if (!active || !payload || payload.length === 0) return null;

        const { date, close, volume } = payload[0].payload;

        return (
            <div className={styles.customTooltip}>
                <p className={styles.description}>Date</p>
                <span className={styles.date}>{formatDate(date)}</span>
                <p className={styles.description}>Price</p>
                <p className={styles.volume}>${formatCryptoPrice(close)}</p>
                <p className={styles.description}>Volume</p>
                <p className={styles.volume}>{formatNumber(volume)}</p>
            </div>
        );
    };

/**
 * Interactive crypto price chart with range controls and instant quick-select chips.
 * @returns The chart panel including instrument input and range toggles.
 * @example
 * <CryptoMarketChart />
 */
const CryptoMarketChart = () => {
    const { selectedCrypto, setSelectedCrypto } = useContext(CryptoMarketContext);
    const immediateNormalized = normalizeCryptoSymbol(selectedCrypto);

    const debouncedRaw = useDebounce(selectedCrypto, 500);
    const normalizedInstrument = normalizeCryptoSymbol(debouncedRaw);

    const { result, isLoading, error } = useCryptoLatestTick({
        market: 'kraken',
        instrument: normalizedInstrument
    });

    // Fetch historical data
    const [selectedRange, setSelectedRange] = useState('1mo');

    const {
        results,
        isLoading: isHistoricalLoading,
        isFetching: isHistoricalFetching,
        isPlaceholderData,
        error: historicalError,
    } = useCryptoHistoricalData({
        market: "kraken",
        instrument: normalizedInstrument,
        range: selectedRange
    });
    const isChartStale = Boolean(isPlaceholderData || isHistoricalFetching);

    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.searchRow}>
                    <span className={styles.title}>Instrument:</span>
                    <span className={styles.search}>
                        <input
                            className={styles.input}
                            type='text'
                            placeholder="Enter a crypto pair (e.g. BTC-USD)..."
                            aria-label="Enter a crypto pair"
                            value={selectedCrypto || ''}
                            onChange={(e) => {
                                setSelectedCrypto(e.target.value.toUpperCase())
                            }}
                        />
                    </span>
                </div>

                <div className={styles.quickPills} role="group" aria-label="Popular crypto pairs">
                    <span className={styles.pillLabel}>Popular:</span>
                    {POPULAR_CRYPTOS.map((coin) => {
                        const isActive =
                            immediateNormalized === coin.pair ||
                            selectedCrypto?.trim().toUpperCase() === coin.label;
                        return (
                            <button
                                key={coin.pair}
                                type="button"
                                className={`${styles.pill} ${isActive ? styles.pillActive : ''}`}
                                onClick={() => setSelectedCrypto(coin.pair)}
                            >
                                {coin.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {error && <p className={styles.message}>Error: {error}</p>}

            {result ? (
                <div className={styles.stockInfo}>
                    <div className={styles.priceSection}>
                        <span className={styles.price}>
                            ${formatCryptoPrice(result.PRICE)}
                        </span>
                        {result.CURRENT_DAY_CHANGE_PERCENTAGE !== undefined && (
                            <span
                                style={{
                                    color:
                                        result.CURRENT_DAY_CHANGE_PERCENTAGE >= 0 ? "var(--gain, #10b981)" : "var(--loss, #ef4444)",
                                    fontWeight: 600,
                                }}
                            >
                                {result.CURRENT_DAY_CHANGE_PERCENTAGE >= 0 ? "+" : ""}
                                {result.CURRENT_DAY_CHANGE_PERCENTAGE.toFixed(2)}%
                                {" "}
                                ({result.CURRENT_DAY_CHANGE >= 0 ? "+" : ""}
                                ${Math.abs(result.CURRENT_DAY_CHANGE).toFixed(2)})
                                <span style={{ color: "var(--textSoft)", fontWeight: 400 }}> Today</span>
                            </span>
                        )}
                    </div>
                </div>
            ) : isLoading ? (
                <div className={styles.stockInfo}>
                    <div className={styles.priceSection}>
                        <span className={styles.priceMuted}>Fetching spot price...</span>
                    </div>
                </div>
            ) : null}

            <div className={styles.chartArea}>
                {results?.length > 0 ? (
                    <>
                        <div style={{ width: '100%', height: '100%', opacity: isChartStale ? 0.45 : 1, transition: 'opacity 0.2s ease' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    width={500}
                                    height={300}
                                    data={results}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 10,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="cryptoGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent, #3b82f6)" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="var(--accent, #3b82f6)" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: "var(--textSoft)", fontSize: 11 }}
                                        stroke="var(--border)"
                                    />
                                    <YAxis
                                        domain={[
                                            (dataMin) => (dataMin * 0.995),
                                            (dataMax) => dataMax * 1.005,
                                        ]}
                                        tickFormatter={(value: number) => formatCryptoPrice(value)}
                                        tick={{ fill: "var(--textSoft)", fontSize: 11 }}
                                        stroke="var(--border)"
                                    />
                                    <Tooltip content={<CryptoTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="close"
                                        stroke="var(--accent, #3b82f6)"
                                        strokeWidth={2}
                                        fill="url(#cryptoGrad)"
                                    />
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
                {[
                    { value: '1d', label: '1D' },
                    { value: '5d', label: '5D' },
                    { value: '1mo', label: '1M' },
                    { value: '3mo', label: '3M' },
                    { value: '6mo', label: '6M' },
                    { value: '1y', label: '1Y' },
                    { value: '5y', label: '5Y' },
                ].map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        className={`${styles.dateButton} ${selectedRange === value ? styles.selected : ''}`}
                        onClick={() => handleRangeChange(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CryptoMarketChart;
