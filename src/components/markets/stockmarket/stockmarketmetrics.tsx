'use client'
import styles from '../marketsmetrics.module.css';
import { useContext, useState } from 'react'
import { MarketContext } from './stockmarketchart';
import useYahooStockQuote from '@/hooks/useYahooStockQuote';
import useDebounce from '@/hooks/useDebounce';

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
                <ul className={styles.metrics}>
                    <li>Market Day Range: {quote.regularMarketDayRange.low} - {quote.regularMarketDayRange.high}</li>
                    <li>52-Week Range: {quote.fiftyTwoWeekRange.low} - {quote.fiftyTwoWeekRange.high}</li>
                    <li>Market Cap: {quote.marketCap}</li>
                    <li>Forward P/E: {quote.forwardPE}</li>
                    <li>Trailing P/E: {quote.trailingPE}</li>
                    <li>Dividend Yield: {quote.dividendYield}</li>
                    <li>Dividend Pay Date: {quote.dividendDate}</li>

                </ul>
            )}

        </div>
    );
};

export default StockMarketMetrics;
