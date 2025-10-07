'use client'
import { useState } from 'react';
import { MoonLoader } from 'react-spinners';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../markets.module.css';
import { createContext, useContext } from 'react'
import useCryptoHistoricalData from '@/hooks/useCryptoHistoricalData';
import useCryptoLatestTick from '@/hooks/useCryptoLatestTick';
import useDebounce from '@/hooks/useDebounce';
import formatNumber from '@/utils/formatNumber';
import formatDate from '@/utils/formatDate';

export const CryptoMarketContext = createContext({
    selectedCrypto: "",
    setSelectedCrypto: (value: string) => { },
});


const CryptoMarketChart = () => {
    const { selectedCrypto, setSelectedCrypto } = useContext(CryptoMarketContext);
    const debouncedCrypto = useDebounce(selectedCrypto, 700);
    const { result, isLoading, error } = useCryptoLatestTick({
        instruments: debouncedCrypto
    });

    // Fetch historical data
    const [selectedRange, setSelectedRange] = useState('1d');

    const { results } = useCryptoHistoricalData({
        market: "kraken",
        instrument: debouncedCrypto,
        range: selectedRange
    });

    const handleRangeChange = (range: string) => {
        setSelectedRange(range);
    };

    interface CustomTooltipProps {
        active?: boolean;
        payload?: string;
        label?: string;
    }

    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (!active || !payload || payload.length === 0) return null;

        const { date, close, volume } = payload[0].payload;

        return (
            <div className={styles.customTooltip} style={{ background: "rgba(36, 131, 71, 0.76)" }}>
                <p className={styles.description}>Current Date</p>
                <span className={styles.date}>{formatDate(date)}</span>
                <p className={styles.description}>Price</p>
                <p className={styles.volume}>${formatNumber(close)}</p>
                <p className={styles.description}>Volume</p>
                <p className={styles.volume}>{formatNumber(volume)}</p>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.title}>Currently Showing: </span>

                <span className={styles.search}>
                    <input
                        className={styles.input}
                        type='text'
                        placeholder="Enter a stock symbol..."
                        value={selectedCrypto || ''}
                        onChange={(e) => {
                            setSelectedCrypto(e.target.value.toUpperCase())
                        }}
                    />
                </span>
            </div>

            {error && <p className={styles.message}>Error: {error}</p>}
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <MoonLoader color="#47ef60ff" size={100} />
                </div>
            )}

            {result && !isLoading && (
                <div className={styles.stockInfo}>
                    <div className={styles.priceSection}>
                        <span className={styles.price}>${result.PRICE?.toFixed(2)} </span>
                        {result.CURRENT_DAY_CHANGE_PERCENTAGE !== undefined && (
                            <span
                                style={{
                                    color:
                                        result.CURRENT_DAY_CHANGE_PERCENTAGE >= 0 ? "#10b981" : "#ef4444",
                                }}
                            >
                                {result.CURRENT_DAY_CHANGE_PERCENTAGE >= 0 ? "+" : ""}
                                {result.CURRENT_DAY_CHANGE_PERCENTAGE.toFixed(2)}%
                                {" "}
                                ({result.CURRENT_DAY_CHANGE >= 0 ? "+" : ""}
                                ${Math.abs(result.CURRENT_DAY_CHANGE).toFixed(2)})
                                <span> Today</span>
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
                            <Tooltip content={(tooltipProps) => <CustomTooltip {...tooltipProps} />} />
                            <Area
                                type="monotone"
                                dataKey="close"
                                stroke="rgba(51, 242, 121, 0.76)"
                                fill="rgba(61, 180, 63, 0.15)" />
                        </AreaChart>
                    </ResponsiveContainer>

                    <hr style={{ border: '1px solid rgba(3, 73, 148, 0.15)' }} />

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

        </div >
    );
};

export default CryptoMarketChart;