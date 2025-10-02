'use client'
import styles from '../marketsmetrics.module.css';
import { useContext, useState } from 'react'
import { MarketContext } from './stockmarketchart';
import useYahooStockQuote from '@/hooks/useYahooStockQuote';

const StockMarketMetrics = () => {
    const { selectedStock } = useContext(MarketContext);
    const { quote, isLoading, error } = useYahooStockQuote(selectedStock);

    return (
        <div className={styles.container}>
            <h2>Key Stock Statistics</h2>
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
