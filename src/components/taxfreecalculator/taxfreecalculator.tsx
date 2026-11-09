'use client';
/**
 * Tax- and fee-adjusted investment return calculator (form + results summary).
 */
import { useState } from "react";
import useCryptoLatestTick from '@/hooks/useCryptoLatestTick';
import useYahooStockQuote from '@/hooks/useYahooStockQuote';
import { YahooQuote } from "@/types/stock";
import useDebounce from '@/hooks/useDebounce';
import styles from './taxfreecalculator.module.css'
import { calculateTaxReturns } from '@/utils/calculateTaxReturns';

interface ResultProps {
    grossProfit: number,
    feeCost: number,
    taxAmount: number,
    netProfit: number,
    netReturn: number
}

/**
 * Renders the calculated gross/fee/tax/net return summary panel.
 * @param props - Computed result fields from {@link TaxAdjustedReturns}.
 * @returns The results panel.
 */
const Results: React.FC<ResultProps> = ({ grossProfit, feeCost, taxAmount, netProfit, netReturn }) => (
    <div className={styles.results}>
        <h3 className={styles.resultsTitle}>Results</h3>

        <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Gross Profit</span>
            <span className={`${styles.resultValue} ${grossProfit < 0 ? styles.negative : styles.positive}`}>
                ${grossProfit.toFixed(2)}
            </span>
        </div>

        <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Fees</span>
            <span className={styles.resultValue}>${feeCost.toFixed(2)}</span>
        </div>

        <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Tax</span>
            <span className={styles.resultValue}>${taxAmount.toFixed(2)}</span>
        </div>

        <div className={styles.divider}></div>

        <div className={`${styles.resultRow} ${styles.resultRowHighlight}`}>
            <span className={styles.resultLabel}>Net Profit</span>
            <span className={`${styles.resultValue} ${styles.resultValueLarge} ${netProfit < 0 ? styles.negative : styles.positive}`}>
                ${netProfit.toFixed(2)}
            </span>
        </div>

        <div className={styles.returnBadge}>
            <span className={styles.returnLabel}>Net Return</span>
            <span className={`${styles.returnValue} ${netReturn < 0 ? styles.negative : styles.positive}`}>
                {netReturn.toFixed(2)}%
            </span>
        </div>
    </div>
);

/**
 * Interactive tax/fee calculator — collects inputs and shows net return results.
 * @returns Tax-adjusted returns form + results panel.
 * @example
 * <TaxAdjustedReturns />
 */
export default function TaxAdjustedReturns() {
    const [marketType, setMarketType] = useState<'crypto' | 'stock' | ''>('');
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [taxRate, setTaxRate] = useState('15');
    const [feeRate, setFeeRate] = useState('0.5');

    // fetch data from correct API only when the matching market is active
    const debouncedSymbol = useDebounce(symbol, 500);

    const { quote } = useYahooStockQuote(marketType === 'stock' ? debouncedSymbol : '') as {
        quote: YahooQuote | null;
        isLoading: boolean;
        error: string | null;
    };

    const { result } = useCryptoLatestTick({
        market: 'kraken',
        instrument: marketType === 'crypto' ? debouncedSymbol : ''
    });

    const numQuantity = parseFloat(quantity);
    const numTaxRate = parseFloat(taxRate);
    const numFeeRate = parseFloat(feeRate);

    const validQuantity = Number.isFinite(numQuantity) && numQuantity > 0 ? numQuantity : 0;
    const validTaxRate = Number.isFinite(numTaxRate) && numTaxRate >= 0 ? Math.min(numTaxRate, 100) : 0;
    const validFeeRate = Number.isFinite(numFeeRate) && numFeeRate >= 0 ? Math.min(numFeeRate, 100) : 0;

    const stockReturns = quote?.regularMarketOpen && quote?.regularMarketPrice && validQuantity > 0
        ? calculateTaxReturns({
            openPrice: quote.regularMarketOpen,
            currentPrice: quote.regularMarketPrice,
            quantity: validQuantity,
            taxRate: validTaxRate,
            feeRate: validFeeRate,
        })
        : null;

    const cryptoReturns = result?.CURRENT_DAY_OPEN && result?.PRICE && validQuantity > 0
        ? calculateTaxReturns({
            openPrice: result.CURRENT_DAY_OPEN,
            currentPrice: result.PRICE,
            quantity: validQuantity,
            taxRate: validTaxRate,
            feeRate: validFeeRate,
        })
        : null;

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
                            <label className={styles.label} htmlFor="calc-symbol">Symbol</label>
                            <input
                                id="calc-symbol"
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
                                <label className={styles.label} htmlFor="calc-quantity">Quantity</label>
                                <input
                                    id="calc-quantity"
                                    type="number"
                                    min="0"
                                    step="any"
                                    className={styles.input}
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="calc-tax-rate">Tax Rate (%)</label>
                                <input
                                    id="calc-tax-rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="any"
                                    className={styles.input}
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(e.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="calc-fee-rate">Fee Rate (%)</label>
                                <input
                                    id="calc-fee-rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="any"
                                    className={styles.input}
                                    value={feeRate}
                                    onChange={(e) => setFeeRate(e.target.value)}
                                />
                            </div>
                        </div>

                        {symbol && validQuantity <= 0 && (
                            <p className={styles.hint}>Please enter a quantity greater than 0 to calculate returns.</p>
                        )}
                    </div>
                )}

                {/* Display results */}
                {marketType == 'stock' && stockReturns && (
                    <Results
                        grossProfit={stockReturns.grossProfit}
                        feeCost={stockReturns.feeCost}
                        taxAmount={stockReturns.taxAmount}
                        netProfit={stockReturns.netProfit}
                        netReturn={stockReturns.netReturn}
                    />
                )}

                {marketType == 'crypto' && cryptoReturns && (
                    <Results
                        grossProfit={cryptoReturns.grossProfit}
                        feeCost={cryptoReturns.feeCost}
                        taxAmount={cryptoReturns.taxAmount}
                        netProfit={cryptoReturns.netProfit}
                        netReturn={cryptoReturns.netReturn}
                    />
                )}

            </div>
        </div>
    );
}
