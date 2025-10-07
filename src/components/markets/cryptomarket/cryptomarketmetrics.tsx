'use client'
import styles from '../marketsmetrics.module.css';
import { useContext } from 'react'
import { CryptoMarketContext } from './cryptomarketchart';
import useCryptoLatestTick from '@/hooks/useCryptoLatestTick';
import useDebounce from '@/hooks/useDebounce';
import formatCurrency from '@/utils/formatCurrency';
import formatNumber from '@/utils/formatNumber';
interface TickResult {
    MARKET: string;
    CURRENT_DAY_LOW: number;
    CURRENT_DAY_HIGH: number;
    CURRENT_DAY_OPEN: number;
    CURRENT_DAY_QUOTE_VOLUME: number;
    BEST_BID: number;
    BEST_ASK: number;
    CURRENT_YEAR_HIGH: number;
    CURRENT_YEAR_LOW: number;
    LIFETIME_HIGH: number;
    PRICE: number;
    CURRENT_DAY_CHANGE: number;
    CURRENT_DAY_CHANGE_PERCENTAGE: number;
}
interface StatItemProps {
    label: string;
    value: string | number;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
    <div className={styles.statItem}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
    </div>
);

const CryptoMarketMetrics = () => {
    const { selectedCrypto } = useContext(CryptoMarketContext);
    const debouncedCrypto = useDebounce(selectedCrypto, 500);
    const { result, isLoading, error } = useCryptoLatestTick({
        instruments: debouncedCrypto,
    }) as { result: TickResult | null; isLoading: boolean; error?: string };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>📊 Key Statistics</h2>

            {error && <p className={styles.error}>⚠️ Error fetching stock data</p>}
            {isLoading && <p className={styles.loading}>Loading...</p>}

            {!result && !isLoading && (
                <p className={styles.error}>⚠️ Please select a coin</p>
            )}

            {result && !isLoading && (
                <div className={styles.statsGrid}>
                    <StatItem
                        label="Market"
                        value={result.MARKET}
                    />
                    <StatItem
                        label="Day Range"
                        value={`${formatCurrency(result.CURRENT_DAY_LOW)} - ${formatCurrency(result.CURRENT_DAY_HIGH)}`}
                    />
                    <StatItem
                        label="Open Price"
                        value={formatCurrency(result.CURRENT_DAY_OPEN)}
                    />
                    <StatItem
                        label="Today's Trading Volume"
                        value={formatNumber(result.CURRENT_DAY_QUOTE_VOLUME)}
                    />
                    <StatItem
                        label="Best Bid"
                        value={formatCurrency(result.BEST_BID)}
                    />
                    <StatItem
                        label="Best Ask"
                        value={formatCurrency(result.BEST_ASK)}
                    />
                    <StatItem
                        label="Current Year High"
                        value={formatCurrency(result.CURRENT_YEAR_HIGH)}
                    />
                    <StatItem
                        label="Current Year Low"
                        value={formatCurrency(result.CURRENT_YEAR_LOW)}
                    />
                    <StatItem
                        label="All Time High"
                        value={formatCurrency(result.LIFETIME_HIGH)}
                    />
                </div>
            )}
        </div>
    );
};

export default CryptoMarketMetrics;