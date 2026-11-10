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

    const spread = result?.BEST_ASK != null && result?.BEST_BID != null
        ? result.BEST_ASK - result.BEST_BID
        : null;

    const formatSpread = (val: number | null): string => {
        if (val == null || !Number.isFinite(val)) return 'N/A';
        if (val === 0) return '$0.00';
        if (val < 0.001) return `$${val.toFixed(6)}`;
        if (val < 0.01) return `$${val.toFixed(4)}`;
        return `$${val.toFixed(2)}`;
    };

    const athDrawdown = result?.LIFETIME_HIGH != null && result.LIFETIME_HIGH > 0 && result?.PRICE
        ? ((result.PRICE - result.LIFETIME_HIGH) / result.LIFETIME_HIGH) * 100
        : null;

    const change24h = result?.MOVING_24_HOUR_CHANGE_PERCENTAGE ?? result?.CURRENT_DAY_CHANGE_PERCENTAGE;

    const quoteCurrency = (result?.QUOTE as string | undefined) ||
        (normalizedCrypto.includes('-') ? normalizedCrypto.split('-')[1] : 'USD');
    const formattedVolume = formatNumber(result?.CURRENT_DAY_QUOTE_VOLUME);
    const volumeDisplay = quoteCurrency === 'USD'
        ? `$${formattedVolume}`
        : `${formattedVolume} ${quoteCurrency}`;

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>Key Statistics</h2>
                {result && <span className={styles.badge}>Crypto Spot</span>}
            </div>

            {error && <p className={styles.error}>Error fetching crypto data</p>}
            {isLoading && <p className={styles.loading}>Loading statistics...</p>}

            {!result && !isLoading && (
                <p className={styles.error}>Please select a coin</p>
            )}

            {result && !isLoading && (
                <>
                    <RangeBar
                        label="Current Year Range"
                        low={result.CURRENT_YEAR_LOW}
                        high={result.CURRENT_YEAR_HIGH}
                        current={result.PRICE ?? result.BEST_BID ?? undefined}
                    />

                    <div className={styles.statsGrid}>
                        <StatItem
                            label="Market"
                            value={result.MARKET}
                        />
                        <StatItem
                            label="Day Open"
                            value={formatCurrency(result.CURRENT_DAY_OPEN)}
                        />
                        <StatItem
                            label="Day Range"
                            value={`${formatCurrency(result.CURRENT_DAY_LOW)} - ${formatCurrency(result.CURRENT_DAY_HIGH)}`}
                        />
                        <StatItem
                            label="Today's Trading Volume"
                            value={volumeDisplay}
                        />
                        <StatItem
                            label="1-Hour Change"
                            value={
                                result.CURRENT_HOUR_CHANGE_PERCENTAGE != null
                                    ? `${result.CURRENT_HOUR_CHANGE_PERCENTAGE >= 0 ? '+' : ''}${result.CURRENT_HOUR_CHANGE_PERCENTAGE.toFixed(2)}%`
                                    : 'N/A'
                            }
                        />
                        <StatItem
                            label="24h Change"
                            value={
                                change24h != null
                                    ? `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`
                                    : 'N/A'
                            }
                        />
                        <StatItem
                            label={`24h Change (${quoteCurrency})`}
                            value={
                                (() => {
                                    const changeVal = result.MOVING_24_HOUR_CHANGE ?? result.CURRENT_DAY_CHANGE;
                                    if (changeVal == null) return 'N/A';
                                    const prefix = changeVal > 0 ? '+' : '';
                                    const formatAmount = (val: number, minDec: number, maxDec: number): string => {
                                        try {
                                            return new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: quoteCurrency,
                                                minimumFractionDigits: minDec,
                                                maximumFractionDigits: maxDec,
                                            }).format(val);
                                        } catch {
                                            return `${val.toLocaleString('en-US', { minimumFractionDigits: minDec, maximumFractionDigits: maxDec })} ${quoteCurrency}`;
                                        }
                                    };
                                    if (changeVal === 0) return formatAmount(0, 2, 2);
                                    const abs = Math.abs(changeVal);
                                    const digits = abs < 0.01 ? (abs < 0.0001 ? 6 : 4) : 2;
                                    return `${prefix}${formatAmount(changeVal, digits, digits)}`;
                                })()
                            }
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
                            label="Bid-Ask Spread"
                            value={formatSpread(spread)}
                        />
                        <StatItem
                            label="All Time High"
                            value={result.LIFETIME_HIGH != null ? formatCurrency(result.LIFETIME_HIGH) : 'N/A'}
                        />
                        <StatItem
                            label="ATH Drawdown"
                            value={athDrawdown != null ? `${athDrawdown.toFixed(1)}%` : 'N/A'}
                        />
                        <StatItem
                            label="Current Year High"
                            value={formatCurrency(result.CURRENT_YEAR_HIGH)}
                        />
                        <StatItem
                            label="Current Year Low"
                            value={formatCurrency(result.CURRENT_YEAR_LOW)}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default CryptoMarketMetrics;
