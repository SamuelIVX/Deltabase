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

const StockMarketMetrics = () => {
    const { selectedStock } = useContext(MarketContext);
    const debouncedStock = useDebounce(selectedStock, 500); // Wait 500ms after typing stops to allow for debouncing
    const { quote, isLoading, error } = useYahooStockQuote(debouncedStock);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Key Stock Statistics</h2>
            {error && <p className={styles.error}>Error fetching stock data</p>}

            {isLoading && <p>Loading...</p>}
            {quote && (
                <>
                    <div className={styles.content}>
                        <span><strong style={{ color: 'beige' }}>Market Day Range:</strong> ${quote.regularMarketDayRange.low} - ${quote.regularMarketDayRange.high}</span>
                        <span><strong style={{ color: 'beige' }}>52-Week Range:</strong> ${quote.fiftyTwoWeekRange.low} - ${quote.fiftyTwoWeekRange.high}</span>
                    </div>

                    <div className={styles.content}>
                        <span><strong style={{ color: 'beige' }}>Market Cap:</strong> {formatCurrency(quote.marketCap)}</span>
                    </div>

                    <div className={styles.content}>
                        <span><strong style={{ color: 'beige' }}>Forward P/E:</strong> {formatNumber(quote.forwardPE)}</span>
                        <span><strong style={{ color: 'beige' }}>Trailing P/E:</strong> {formatNumber(quote.trailingPE)}</span>

                    </div>

                    <div className={styles.content}>
                        <span><strong style={{ color: 'beige' }}>Dividend Yield:</strong> {formatPercent(quote.dividendYield)}</span>
                        <span><strong style={{ color: 'beige' }}>Dividend Pay Date:</strong> {formatDate(quote.dividendDate)}</span>
                    </div>

                </>
            )}

        </div>
    );
};

export default StockMarketMetrics;
