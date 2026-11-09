'use client'
/**
 * Stock market metrics panel — Yahoo quote stats for the selected ticker.
 * Displays key valuation figures, ETF expense ratios, and an accessible 52-week range bar.
 */
import React, { useContext } from 'react'
import styles from '../marketsmetrics.module.css';
import { StockMarketContext } from './stockmarketchart';
import useYahooStockQuote from '@/hooks/useYahooStockQuote';
import { YahooQuote } from '@/types/stock';
import useDebounce from '@/hooks/useDebounce';
import { StatItemProps } from '@/types/statItem';
import formatCurrency from '@/utils/formatCurrency';
import formatNumber from '@/utils/formatNumber';
import formatPercent from '@/utils/formatPercent';
import RangeBar from '../common/RangeBar';

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
    <div className={styles.statItem}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
    </div>
);

/**
 * Displays Yahoo quote metrics and key valuation ratios for the selected ticker.
 * @returns The key-statistics panel.
 */
const StockMarketMetrics = () => {
    const { selectedStock } = useContext(StockMarketContext);
    const debouncedStock = useDebounce(selectedStock, 500);
    const { quote, isLoading, error } = useYahooStockQuote(debouncedStock) as {
        quote: YahooQuote | null;
        isLoading: boolean;
        error: string | null;
    };

    const isETF = Boolean(
        quote && (quote.quoteType === 'ETF' || quote.netExpenseRatio != null)
    );

    const rangeLow = quote?.fiftyTwoWeekRange?.low ?? quote?.fiftyTwoWeekLow;
    const rangeHigh = quote?.fiftyTwoWeekRange?.high ?? quote?.fiftyTwoWeekHigh;
    const currentPrice = quote?.regularMarketPrice;

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>Key Statistics</h2>
                {quote && (
                    <span className={styles.badge}>
                        {isETF ? 'ETF' : 'Equity'}
                    </span>
                )}
            </div>

            {error && <p className={styles.error}>Error fetching stock data</p>}
            {isLoading && <p className={styles.loading}>Loading statistics...</p>}

            {!quote && !isLoading && (
                <p className={styles.error}>Please select a stock</p>
            )}

            {quote && !isLoading && (
                <>
                    <RangeBar
                        label="52-Week Range"
                        low={rangeLow}
                        high={rangeHigh}
                        current={currentPrice}
                    />

                    <div className={styles.statsGrid}>
                        <StatItem
                            label="Previous Close"
                            value={quote.regularMarketPreviousClose != null ? formatCurrency(quote.regularMarketPreviousClose) : 'N/A'}
                        />
                        <StatItem
                            label="Open"
                            value={quote.regularMarketOpen != null ? formatCurrency(quote.regularMarketOpen) : 'N/A'}
                        />
                        <StatItem
                            label="Day Range"
                            value={
                                quote.regularMarketDayRange?.low != null && quote.regularMarketDayRange?.high != null
                                    ? `$${quote.regularMarketDayRange.low} - $${quote.regularMarketDayRange.high}`
                                    : 'N/A'
                            }
                        />
                        <StatItem
                            label="Volume"
                            value={quote.regularMarketVolume != null ? formatNumber(quote.regularMarketVolume) : 'N/A'}
                        />
                        <StatItem
                            label="Avg Volume (3M)"
                            value={quote.averageDailyVolume3Month != null ? formatNumber(quote.averageDailyVolume3Month) : 'N/A'}
                        />
                        <StatItem
                            label="Market Cap"
                            value={formatCurrency(quote.marketCap)}
                        />
                        <StatItem
                            label="52-Week Range"
                            value={
                                rangeLow != null && rangeHigh != null
                                    ? `$${rangeLow} - $${rangeHigh}`
                                    : 'N/A'
                            }
                        />
                        {isETF ? (
                            <StatItem
                                label="Expense Ratio"
                                value={
                                    quote.netExpenseRatio != null
                                        ? `${quote.netExpenseRatio.toFixed(2)}%`
                                        : 'N/A'
                                }
                            />
                        ) : (
                            <StatItem
                                label="Forward P/E"
                                value={formatNumber(quote.forwardPE)}
                            />
                        )}
                        <StatItem
                            label="Trailing P/E"
                            value={formatNumber(quote.trailingPE)}
                        />
                        <StatItem
                            label="Beta"
                            value={quote.beta != null ? formatNumber(quote.beta) : 'N/A'}
                        />
                        {!isETF ? (
                            <StatItem
                                label="EPS (TTM)"
                                value={formatNumber(quote.priceEpsCurrentYear)}
                            />
                        ) : (
                            <StatItem
                                label="Asset Class"
                                value="Exchange Traded"
                            />
                        )}
                        <StatItem
                            label="Dividend Yield"
                            value={formatPercent(quote.dividendYield)}
                        />
                        {quote.dividendRate != null && (
                            <StatItem
                                label="Dividend Rate"
                                value={formatCurrency(quote.dividendRate)}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default StockMarketMetrics;
