'use client';
/**
 * Tax- and fee-adjusted investment return calculator (form, breakdown chart, and presets).
 * Computes net returns accounting for capital gains taxes and brokerage/exchange fees.
 */
import React, { useState } from "react";
import useCryptoLatestTick from '@/hooks/useCryptoLatestTick';
import useYahooStockQuote from '@/hooks/useYahooStockQuote';
import useDebounce from '@/hooks/useDebounce';
import styles from './taxfeecalculator.module.css';
import { calculateTaxReturns } from '@/utils/calculateTaxReturns';
import TaxBreakdownChart from './TaxBreakdownChart';
import {
    SHORT_TERM_TAX_BRACKETS,
    LONG_TERM_TAX_BRACKETS,
    STATE_TAX_PRESETS,
    FEE_PRESETS,
} from '@/types/tax';
import { formatTaxCurrency, formatTaxRate } from '@/utils/formatTaxCurrency';

interface ResultProps {
    grossProfit: number;
    feeCost: number;
    taxAmount: number;
    netProfit: number;
    netReturn: number;
}

const POPULAR_STOCKS = ['AAPL', 'MSFT', 'NVDA', 'SPY', 'QQQ', 'TSLA'];
const POPULAR_CRYPTOS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD'];

/**
 * Renders the calculated gross/fee/tax/net return summary panel.
 * @param props - Computed result fields from {@link TaxAdjustedReturns}.
 * @returns {JSX.Element} The results panel.
 */
const Results: React.FC<ResultProps> = ({ grossProfit, feeCost, taxAmount, netProfit, netReturn }) => (
    <div className={styles.results} role="region" aria-label="Calculation Results">
        <h3 className={styles.resultsTitle}>Results</h3>

        <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Gross Profit</span>
            <span className={`${styles.resultValue} ${grossProfit < 0 ? styles.negative : styles.positive}`}>
                {formatTaxCurrency(grossProfit)}
            </span>
        </div>

        <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Fees</span>
            <span className={styles.resultValue}>{formatTaxCurrency(feeCost)}</span>
        </div>

        <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Tax</span>
            <span className={styles.resultValue}>{formatTaxCurrency(taxAmount)}</span>
        </div>

        <div className={styles.divider}></div>

        <div className={`${styles.resultRow} ${styles.resultRowHighlight}`}>
            <span className={styles.resultLabel}>Net Profit</span>
            <span className={`${styles.resultValue} ${styles.resultValueLarge} ${netProfit < 0 ? styles.negative : styles.positive}`}>
                {formatTaxCurrency(netProfit)}
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
 * Interactive tax/fee calculator — collects inputs, presets, and displays visual net return breakdown.
 * @returns {JSX.Element} Tax-adjusted returns form, presets, and results.
 * @example
 * <TaxAdjustedReturns />
 */
export default function TaxAdjustedReturns() {
    const [marketType, setMarketType] = useState<'crypto' | 'stock' | ''>('');
    const [symbol, setSymbol] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [costBasisInput, setCostBasisInput] = useState('');
    const [exitPriceInput, setExitPriceInput] = useState('');
    const [federalRate, setFederalRate] = useState<number>(15);
    const [stateRate, setStateRate] = useState<number>(0);
    const [selectedStatePreset, setSelectedStatePreset] = useState<number | null>(0);
    const [taxRate, setTaxRate] = useState('15');
    const [feeRate, setFeeRate] = useState('0.5');
    const [holdingPeriod, setHoldingPeriod] = useState<'short' | 'long'>('long');
    const [isTaxPreset, setIsTaxPreset] = useState(true);

    // Fetch data from correct API only when the matching market is active
    const debouncedSymbol = useDebounce(symbol, 500);

    const { quote, isLoading: isQuoteLoading, error: quoteError } = useYahooStockQuote(
        marketType === 'stock' ? debouncedSymbol : ''
    );

    const { result, isLoading: isCryptoLoading, error: cryptoError } = useCryptoLatestTick({
        market: 'kraken',
        instrument: marketType === 'crypto' ? debouncedSymbol : ''
    });

    const activeError = marketType === 'stock' ? quoteError : cryptoError;

    const isDebouncing = symbol.trim().toUpperCase() !== debouncedSymbol.trim().toUpperCase();
    const isLiveLoading = isQuoteLoading || isCryptoLoading || isDebouncing;

    // Resolve active prices (custom inputs take precedence, fallback to live quote prices)
    const liveOpenPrice = !isDebouncing
        ? (marketType === 'stock' ? (quote?.regularMarketOpen ?? null) : (result?.CURRENT_DAY_OPEN ?? null))
        : null;
    const liveCurrentPrice = !isDebouncing
        ? (marketType === 'stock' ? (quote?.regularMarketPrice ?? null) : (result?.PRICE ?? null))
        : null;

    const parsedCostBasis = parseFloat(costBasisInput);
    const parsedExitPrice = parseFloat(exitPriceInput);

    const effectiveOpenPrice = Number.isFinite(parsedCostBasis) && parsedCostBasis > 0
        ? parsedCostBasis
        : (liveOpenPrice ?? 0);

    const effectiveCurrentPrice = Number.isFinite(parsedExitPrice) && parsedExitPrice > 0
        ? parsedExitPrice
        : (liveCurrentPrice ?? 0);

    const numQuantity = parseFloat(quantity);
    const numTaxRate = parseFloat(taxRate);
    const numFeeRate = parseFloat(feeRate);

    const validQuantity = Number.isFinite(numQuantity) && numQuantity > 0 ? numQuantity : 0;
    const validTaxRate = Number.isFinite(numTaxRate) && numTaxRate >= 0 ? Math.min(numTaxRate, 100) : 0;
    const validFeeRate = Number.isFinite(numFeeRate) && numFeeRate >= 0 ? Math.min(numFeeRate, 100) : 0;

    const returns = effectiveOpenPrice > 0 && effectiveCurrentPrice > 0 && validQuantity > 0
        ? calculateTaxReturns({
            openPrice: effectiveOpenPrice,
            currentPrice: effectiveCurrentPrice,
            quantity: validQuantity,
            taxRate: validTaxRate,
            feeRate: validFeeRate,
        })
        : null;

    const handleMarketSelect = (type: 'stock' | 'crypto') => {
        if (type !== marketType) {
            setSymbol(type === 'stock' ? 'AAPL' : 'BTC-USD');
        }
        setMarketType(type);
        setCostBasisInput('');
        setExitPriceInput('');
    };

    const handleFetchLivePrice = () => {
        if (liveOpenPrice && liveCurrentPrice) {
            setCostBasisInput(liveOpenPrice.toString());
            setExitPriceInput(liveCurrentPrice.toString());
        }
    };

    const handleHoldingPeriodChange = (period: 'short' | 'long') => {
        setHoldingPeriod(period);
        if (isTaxPreset) {
            const newFederal = period === 'short' ? 24 : 15;
            setFederalRate(newFederal);
            setTaxRate(formatTaxRate(newFederal + stateRate));
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.headerRow}>
                    <h2 className={styles.title}>Tax-Adjusted Returns</h2>
                </div>

                {/* Market type selector */}
                <div className={styles.buttonContainer} role="group" aria-label="Market selection">
                    <button
                        type="button"
                        onClick={() => handleMarketSelect('stock')}
                        aria-pressed={marketType === 'stock'}
                        className={`${styles.toggleButton} ${marketType === 'stock' ? styles.toggleButtonActive : ''}`}
                    >
                        Stock
                    </button>
                    <button
                        type="button"
                        onClick={() => handleMarketSelect('crypto')}
                        aria-pressed={marketType === 'crypto'}
                        className={`${styles.toggleButton} ${marketType === 'crypto' ? styles.toggleButtonActive : ''}`}
                    >
                        Crypto
                    </button>
                </div>

                {/* Common input fields for stock or crypto */}
                {marketType && (
                    <div className={styles.section}>
                        {/* Symbol Input & Popular Chips */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="calc-symbol">Symbol</label>
                            <div className={styles.symbolRow}>
                                <div className={styles.symbolInputGroup}>
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
                                <button
                                    type="button"
                                    className={styles.fetchLiveBtn}
                                    onClick={handleFetchLivePrice}
                                    disabled={!liveOpenPrice || !liveCurrentPrice || isLiveLoading}
                                    title="Auto-fill cost basis and exit price with current market quote"
                                >
                                    {isLiveLoading ? 'Fetching...' : 'Fetch Live Price'}
                                </button>
                            </div>

                            {activeError && !isLiveLoading && (
                                <p className={styles.errorHint} role="alert">
                                    {activeError}
                                </p>
                            )}

                            <div className={styles.chipsRow} role="group" aria-label="Popular tickers">
                                <span className={styles.chipsLabel}>Popular:</span>
                                {(marketType === 'stock' ? POPULAR_STOCKS : POPULAR_CRYPTOS).map((chipSym) => (
                                    <button
                                        key={chipSym}
                                        type="button"
                                        aria-pressed={symbol === chipSym}
                                        className={`${styles.chip} ${symbol === chipSym ? styles.chipActive : ''}`}
                                        onClick={() => {
                                            setSymbol(chipSym);
                                            setCostBasisInput('');
                                            setExitPriceInput('');
                                        }}
                                    >
                                        {chipSym}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Price & Quantity Grid */}
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="calc-cost-basis">
                                    Cost Basis / Buy Price ($)
                                </label>
                                <input
                                    id="calc-cost-basis"
                                    type="number"
                                    min="0"
                                    step="any"
                                    className={styles.input}
                                    placeholder={liveOpenPrice ? liveOpenPrice.toFixed(2) : "0.00"}
                                    value={costBasisInput}
                                    onChange={(e) => setCostBasisInput(e.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="calc-exit-price">
                                    Exit / Sell Price ($)
                                </label>
                                <input
                                    id="calc-exit-price"
                                    type="number"
                                    min="0"
                                    step="any"
                                    className={styles.input}
                                    placeholder={liveCurrentPrice ? liveCurrentPrice.toFixed(2) : "0.00"}
                                    value={exitPriceInput}
                                    onChange={(e) => setExitPriceInput(e.target.value)}
                                />
                            </div>

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
                        </div>

                        {/* Holding Period & Capital Gains Tax Presets */}
                        <div className={styles.presetBlock}>
                            <label className={styles.label} htmlFor="calc-tax-rate">
                                Tax Rate (%)
                            </label>

                            <div className={styles.presetButtons} role="group" aria-label="Holding period">
                                <button
                                    type="button"
                                    aria-pressed={holdingPeriod === 'long'}
                                    className={`${styles.presetBtn} ${holdingPeriod === 'long' ? styles.presetBtnActive : ''}`}
                                    onClick={() => handleHoldingPeriodChange('long')}
                                >
                                    Long-Term (&gt; 1 Year)
                                </button>
                                <button
                                    type="button"
                                    aria-pressed={holdingPeriod === 'short'}
                                    className={`${styles.presetBtn} ${holdingPeriod === 'short' ? styles.presetBtnActive : ''}`}
                                    onClick={() => handleHoldingPeriodChange('short')}
                                >
                                    Short-Term (&lt; 1 Year)
                                </button>
                            </div>

                            <div className={styles.presetButtons} role="group" aria-label="Tax bracket presets">
                                {(holdingPeriod === 'short' ? SHORT_TERM_TAX_BRACKETS : LONG_TERM_TAX_BRACKETS).map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        aria-pressed={isTaxPreset && federalRate === preset.rate}
                                        className={`${styles.presetBtn} ${isTaxPreset && federalRate === preset.rate ? styles.presetBtnActive : ''}`}
                                        onClick={() => {
                                            setIsTaxPreset(true);
                                            setFederalRate(preset.rate);
                                            setTaxRate(formatTaxRate(preset.rate + stateRate));
                                        }}
                                        title={preset.description}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            <div className={styles.presetButtons} role="group" aria-label="State tax presets">
                                <span className={styles.chipsLabel}>State:</span>
                                {STATE_TAX_PRESETS.map((statePreset) => (
                                    <button
                                        key={statePreset.label}
                                        type="button"
                                        aria-pressed={selectedStatePreset === statePreset.rate}
                                        className={`${styles.chip} ${selectedStatePreset === statePreset.rate ? styles.chipActive : ''}`}
                                        onClick={() => {
                                            setIsTaxPreset(true);
                                            setSelectedStatePreset(statePreset.rate);
                                            setStateRate(statePreset.rate);
                                            setTaxRate(formatTaxRate(federalRate + statePreset.rate));
                                        }}
                                        title={`Add state tax (${statePreset.description})`}
                                    >
                                        +{statePreset.label} {statePreset.name ? `(${statePreset.name})` : ''}
                                    </button>
                                ))}
                            </div>

                            <input
                                id="calc-tax-rate"
                                type="number"
                                min="0"
                                max="100"
                                step="any"
                                className={styles.input}
                                value={taxRate}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const val = parseFloat(raw);
                                    if (Number.isFinite(val) && val > 100) {
                                        setTaxRate('100');
                                        setFederalRate(100);
                                    } else {
                                        setTaxRate(raw);
                                        if (Number.isFinite(val)) {
                                            setFederalRate(Math.max(0, val));
                                        } else {
                                            setFederalRate(0);
                                        }
                                    }
                                    setIsTaxPreset(false);
                                    setSelectedStatePreset(null);
                                    setStateRate(0);
                                }}
                            />
                        </div>

                        {/* Transaction Fee Rate & Brokerage Presets */}
                        <div className={styles.presetBlock}>
                            <label className={styles.label} htmlFor="calc-fee-rate">Fee Rate (%)</label>
                            <div className={styles.presetButtons} role="group" aria-label="Fee presets">
                                {FEE_PRESETS.filter(
                                    (preset) => preset.category === 'both' || preset.category === marketType
                                ).map((preset) => (
                                    <button
                                        key={preset.label}
                                        type="button"
                                        aria-pressed={numFeeRate === preset.rate}
                                        className={`${styles.presetBtn} ${numFeeRate === preset.rate ? styles.presetBtnActive : ''}`}
                                        onClick={() => setFeeRate(preset.rate.toString())}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

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

                        {symbol && validQuantity <= 0 && (
                            <p className={styles.hint}>Please enter a quantity greater than 0 to calculate returns.</p>
                        )}
                    </div>
                )}

                {/* Display standard results breakdown */}
                {returns && (
                    <>
                        <Results
                            grossProfit={returns.grossProfit}
                            feeCost={returns.feeCost}
                            taxAmount={returns.taxAmount}
                            netProfit={returns.netProfit}
                            netReturn={returns.netReturn}
                        />

                        {/* Visual Retained Waterfall Breakdown */}
                        <TaxBreakdownChart
                            breakdown={returns}
                            symbol={symbol}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
