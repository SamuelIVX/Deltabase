'use client'
/**
 * Crypto market metrics panel — latest tick stats for the selected instrument.
 */
import React, { useContext } from 'react'
import styles from '../marketsmetrics.module.css';
import { CryptoMarketContext } from './cryptomarketchart';
import useCryptoLatestTick from '@/hooks/useCryptoLatestTick';
import useDebounce from '@/hooks/useDebounce';
import { TickResult } from '@/types/crypto';
import { StatItemProps } from '@/types/statItem';
import formatCurrency from '@/utils/formatCurrency';
import formatNumber from '@/utils/formatNumber';
import RangeBar from '../common/RangeBar';
import { normalizeCryptoSymbol } from '@/utils/normalizeCryptoSymbol';

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
    <div className={styles.statItem}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
    </div>
);

/**
 * Displays latest CoinDesk tick metrics for the selected instrument.
 * @returns The key-statistics panel.
 */
const CryptoMarketMetrics = () => {
    const { selectedCrypto } = useContext(CryptoMarketContext);
    const debouncedCrypto = useDebounce(selectedCrypto, 500);
    const normalizedCrypto = normalizeCryptoSymbol(debouncedCrypto);
    const { result, isLoading, error } = useCryptoLatestTick({
        market: 'kraken',
        instrument: normalizedCrypto,
    }) as { result: TickResult | null; isLoading: boolean; error?: string };

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>Key Statistics</h2>
                {result && <span className={styles.badge}>Crypto</span>}
            </div>

            {error && <p className={styles.error}>Error fetching crypto data</p>}
            {isLoading && <p className={styles.loading}>Loading statistics...</p>}

            {!result && !isLoading && (
                <p className={styles.error}>Please select a coin</p>
            )}

            {result && !isLoading && (
                <>
                    <RangeBar
                        label="Year Range"
                        low={result.CURRENT_YEAR_LOW}
                        high={result.CURRENT_YEAR_HIGH}
                        current={result.BEST_BID ?? undefined}
                    />

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
                </>
            )}
        </div>
    );
};

export default CryptoMarketMetrics;
