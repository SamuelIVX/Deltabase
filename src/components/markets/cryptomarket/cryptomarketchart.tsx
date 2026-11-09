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
                <p className={styles.volume}>${typeof close === 'number' ? close.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : formatNumber(close)}</p>
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
    const debouncedRaw = useDebounce(selectedCrypto, 600);
    const normalizedInstrument = normalizeCryptoSymbol(debouncedRaw);

    const { result, isLoading, error } = useCryptoLatestTick({
        market: 'kraken',
        instrument: normalizedInstrument
    });

    // Fetch historical data
    const [selectedRange, setSelectedRange] = useState('1mo');

    const { results } = useCryptoHistoricalData({
        market: "kraken",
        instrument: normalizedInstrument,
        range: selectedRange
    });

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
                            normalizedInstrument === coin.pair ||
                            selectedCrypto?.toUpperCase() === coin.label;
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
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <MoonLoader color="var(--accent, #3b82f6)" size={64} />
                </div>
            )}

            {result && !isLoading && (
                <div className={styles.stockInfo}>
                    <div className={styles.priceSection}>
                        <span className={styles.price}>
                            ${result.PRICE != null ? result.PRICE.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
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
            )}

            {results?.length > 0 && (
                <>
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
                                tickFormatter={(value) => value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
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

                    <div className={styles.dateRangeButtons}>
                        {['1d', '5d', '1mo', '3mo', '6mo', '1y', '5y'].map((range) => (
                            <button
                                key={range}
                                className={`${styles.dateButton} ${selectedRange === range ? styles.selected : ''}`}
                                onClick={() => handleRangeChange(range)}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CryptoMarketChart;
