'use client';
import { useState } from "react";
import useCryptoLatestTick from '@/hooks/useCryptoLatestTick';
import useYahooStockQuote from '@/hooks/useYahooStockQuote';
import useDebounce from '@/hooks/useDebounce';
import styles from './taxfreecalculator.module.css'
interface YahooQuote {
    regularMarketPrice: number;
    regularMarketChangePercent: number;
    regularMarketTime: string;
    regularMarketOpen: number;
    postMarketPrice?: number;
    postMarketChangePercent?: number;
    currency?: string;
}

interface CryptoTickResult {
    PRICE: number;
    CURRENT_DAY_OPEN: number;
    CURRENT_DAY_CHANGE_PERCENTAGE: number;
    CURRENT_HOUR_CHANGE_PERCENTAGE: number;
    MOVING_24_HOUR_CHANGE_PERCENTAGE: number;
    CURRENT_DAY_CHANGE: number;
    CURRENT_DAY_QUOTE_VOLUME: number;
    [key: string]: unknown;
}

export default function TaxAdjustedReturns() {
    const [marketType, setMarketType] = useState<'crypto' | 'stock' | ''>('');
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [taxRate, setTaxRate] = useState(15);
    const [feeRate, setFeeRate] = useState(0.5);

    // fetch data from correct API
    const debouncedSymbol = useDebounce(symbol, 500);

    const { quote } = useYahooStockQuote(debouncedSymbol) as {
        quote: YahooQuote | null;
        isLoading: boolean;
        error: string | null;
    };

    const { result } = useCryptoLatestTick({
        instruments: debouncedSymbol
    });

    const calculateStockReturns = (quote: YahooQuote) => {
        if (!quote?.regularMarketPrice || !quote?.regularMarketOpen) {
            return null;
        }

        const grossProfit = (quote?.regularMarketPrice - quote?.regularMarketOpen) * quantity;
        const feeCost = ((quote?.regularMarketOpen + quote?.regularMarketPrice) * quantity * feeRate) / 100;
        const taxableProfit = grossProfit - feeCost;
        const taxAmount = taxableProfit > 0 ? (taxableProfit * taxRate) / 100 : 0;
        const netProfit = taxableProfit - taxAmount;
        const netReturn = quote?.regularMarketOpen > 0 ? (netProfit / (quote?.regularMarketOpen * quantity)) * 100 : 0;

        return {
            grossProfit,
            feeCost,
            taxableProfit,
            taxAmount,
            netProfit,
            netReturn
        };
    };

    const calculateCryptoReturns = (result: CryptoTickResult) => {
        if (!result?.PRICE || !result?.CURRENT_DAY_OPEN) {
            return null;
        }

        const grossProfit = (result?.PRICE - result?.CURRENT_DAY_OPEN) * quantity;
        const feeCost = ((result?.CURRENT_DAY_OPEN + result?.PRICE) * quantity * feeRate) / 100;
        const taxableProfit = grossProfit - feeCost;
        const taxAmount = taxableProfit > 0 ? (taxableProfit * taxRate) / 100 : 0;
        const netProfit = taxableProfit - taxAmount;
        const netReturn = result?.CURRENT_DAY_OPEN > 0 ? (netProfit / (result?.CURRENT_DAY_OPEN * quantity)) * 100 : 0;
        console.log('CURRENT_DAY_OPEN:', result?.CURRENT_DAY_OPEN);
        console.log('PRICE:', result?.PRICE);
        console.log('Difference:', result?.PRICE - result?.CURRENT_DAY_OPEN);
        return {
            grossProfit,
            feeCost,
            taxableProfit,
            taxAmount,
            netProfit,
            netReturn
        };
    };

    const stockReturns = quote ? calculateStockReturns(quote) : null;
    const cryptoReturns = result ? calculateCryptoReturns(result) : null;

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <h2 className={styles.title}>Tax-Adjusted Returns</h2>

                {/* Market type selector */}
                <div className={styles.buttonContainer}>
                    <button
                        onClick={() => setMarketType('stock')}
                        className={`${styles.toggleButton} ${marketType === 'stock' ? styles.toggleButtonActive : ''}`}
                    >
                        Stock
                    </button>
                    <button
                        onClick={() => setMarketType('crypto')}
                        className={`${styles.toggleButton} ${marketType === 'crypto' ? styles.toggleButtonActive : ''}`}
                    >
                        Crypto
                    </button>
                </div>

                {/* Common input fields for stock or crypto */}
                {marketType && (
                    <div className={styles.section}>
                        {/* Symbol Input */}
                        <div className={styles.field}>
                            <label className={styles.label}>Symbol</label>
                            <input
                                className={styles.input}
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                placeholder={
                                    marketType === 'crypto' ? 'e.g. BTC-USD' : 'e.g. AAPL'
                                }
                            />
                        </div>

                        {/* Quantity / Tax / Fee inputs */}
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label className={styles.label}>Quantity</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Tax Rate (%)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Fee Rate (%)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={feeRate}
                                    onChange={(e) => setFeeRate(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Display results */}
                {marketType == 'stock' && stockReturns && (
                    <div className={styles.results}>
                        <h3 className={styles.resultsTitle}>Results</h3>

                        <div className={styles.resultRow}>
                            <span className={styles.resultLabel}>Gross Profit</span>
                            <span className={`${styles.resultValue} ${stockReturns.grossProfit < 0 ? styles.negative : styles.positive}`}>
                                ${stockReturns.grossProfit.toFixed(2)}
                            </span>
                        </div>

                        <div className={styles.resultRow}>
                            <span className={styles.resultLabel}>Fees</span>
                            <span className={styles.resultValue}>${stockReturns.feeCost.toFixed(2)}</span>
                        </div>

                        <div className={styles.resultRow}>
                            <span className={styles.resultLabel}>Tax</span>
                            <span className={styles.resultValue}>${stockReturns.taxAmount.toFixed(2)}</span>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={`${styles.resultRow} ${styles.resultRowHighlight}`}>
                            <span className={styles.resultLabel}>Net Profit</span>
                            <span className={`${styles.resultValue} ${styles.resultValueLarge} ${stockReturns.netProfit < 0 ? styles.negative : styles.positive}`}>
                                ${stockReturns.netProfit.toFixed(2)}
                            </span>
                        </div>

                        <div className={styles.returnBadge}>
                            <span className={styles.returnLabel}>Net Return</span>
                            <span className={`${styles.returnValue} ${stockReturns.netReturn < 0 ? styles.negative : styles.positive}`}>
                                {stockReturns.netReturn.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                )}

                {marketType == 'crypto' && cryptoReturns && (
                    <div className={styles.results}>
                        <h3 className={styles.resultsTitle}>Results</h3>

                        <div className={styles.resultRow}>
                            <span className={styles.resultLabel}>Gross Profit</span>
                            <span className={`${styles.resultValue} ${cryptoReturns.grossProfit < 0 ? styles.negative : styles.positive}`}>
                                ${cryptoReturns.grossProfit.toFixed(2)}
                            </span>
                        </div>

                        <div className={styles.resultRow}>
                            <span className={styles.resultLabel}>Fees</span>
                            <span className={styles.resultValue}>${cryptoReturns.feeCost.toFixed(2)}</span>
                        </div>

                        <div className={styles.resultRow}>
                            <span className={styles.resultLabel}>Tax</span>
                            <span className={styles.resultValue}>${cryptoReturns.taxAmount.toFixed(2)}</span>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={`${styles.resultRow} ${styles.resultRowHighlight}`}>
                            <span className={styles.resultLabel}>Net Profit</span>
                            <span className={`${styles.resultValue} ${styles.resultValueLarge} ${cryptoReturns.netProfit < 0 ? styles.negative : styles.positive}`}>
                                ${cryptoReturns.netProfit.toFixed(2)}
                            </span>
                        </div>

                        <div className={styles.returnBadge}>
                            <span className={styles.returnLabel}>Net Return</span>
                            <span className={`${styles.returnValue} ${cryptoReturns.netReturn < 0 ? styles.negative : styles.positive}`}>
                                {cryptoReturns.netReturn.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
