'use client'
import styles from '../marketsmetrics.module.css';
import { useContext } from 'react'
import { MarketContext } from './stockmarketchart';
import useYahooStockQuote from '@/hooks/useYahooStockQuote';
import useDebounce from '@/hooks/useDebounce';
import formatCurrency from '@/utils/formatCurrency';
import formatNumber from '@/utils/formatNumber';
import formatPercent from '@/utils/formatPercent';
import formatDate from '@/utils/formatDate';

const StatItem = ({ label, value }) => (
    <div className={styles.statItem}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
    </div>
);

const StockMarketMetrics = () => {
    const { selectedStock } = useContext(MarketContext);
    const debouncedStock = useDebounce(selectedStock, 500);
    const { quote, isLoading, error } = useYahooStockQuote(debouncedStock);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>📊 Key Statistics</h2>

            {error && <p className={styles.error}>⚠️ Error fetching stock data</p>}
            {isLoading && <p className={styles.loading}>Loading...</p>}

            {!quote && !isLoading && (
                <p className={styles.error}>⚠️ Please select a stock</p>
            )}

            {quote && !isLoading && (
                <div className={styles.statsGrid}>
                    <StatItem
                        label="Market Cap"
                        value={formatCurrency(quote.marketCap)}
                    />
                    <StatItem
                        label="Day Range"
                        value={`$${quote.regularMarketDayRange.low} - $${quote.regularMarketDayRange.high}`}
                    />
                    <StatItem
                        label="52-Week Range"
                        value={`$${quote.fiftyTwoWeekRange.low} - $${quote.fiftyTwoWeekRange.high}`}
                    />
                    <StatItem
                        label="Forward P/E"
                        value={formatNumber(quote.forwardPE)}
                    />
                    <StatItem
                        label="Trailing P/E"
                        value={formatNumber(quote.trailingPE)}
                    />
                    <StatItem
                        label="EPS (TTM)"
                        value={formatNumber(quote.priceEpsCurrentYear)}
                    />
                    <StatItem
                        label="Dividend Yield"
                        value={formatPercent(quote.dividendYield)}
                    />
                    <StatItem
                        label="Dividend Rate"
                        value={formatPercent(quote.dividendRate)}
                    />
                    <StatItem
                        label="Dividend Date"
                        value={formatDate(quote.dividendDate)}
                    />
                </div>
            )}
        </div>
    );
};

export default StockMarketMetrics;