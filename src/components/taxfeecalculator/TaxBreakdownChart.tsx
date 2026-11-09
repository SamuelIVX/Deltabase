'use client';
/**
 * Visual breakdown chart for tax- and fee-adjusted investment returns.
 * Shows relative distribution of cost basis, fee drag, tax drag, and net proceeds.
 */
import React from 'react';
import type { TaxReturnsBreakdown } from '@/types/tax';
import { formatTaxCurrency } from '@/utils/formatTaxCurrency';
import styles from './TaxBreakdownChart.module.css';

/** Props for the {@link TaxBreakdownChart} component. */
export interface TaxBreakdownChartProps {
    breakdown: TaxReturnsBreakdown;
    symbol?: string;
}

/**
 * Visual stacked waterfall chart displaying proceeds, taxes, fees, and net retained profit.
 * @param props - Breakdown data containing profit, fee, tax, and capital figures.
 * @returns {JSX.Element} Visual breakdown component.
 * @example
 * <TaxBreakdownChart breakdown={calculatedBreakdown} symbol="AAPL" />
 */
const TaxBreakdownChart: React.FC<TaxBreakdownChartProps> = ({ breakdown, symbol }) => {
    const {
        initialInvestment,
        grossProfit,
        feeCost,
        taxAmount,
        netProfit,
        totalExitValue,
    } = breakdown;

    const isGrossGain = grossProfit > 0;
    const isNetGain = netProfit > 0;
    const totalDrag = feeCost + taxAmount;
    const dragPercentage = isGrossGain
        ? Math.min((totalDrag / grossProfit) * 100, 100)
        : 0;

    // Calculate proportions for visual bar
    const grossExitTotal = Math.max(
        initialInvestment + Math.max(grossProfit, 0),
        initialInvestment + feeCost + taxAmount,
        1,
    );
    const basisWidth = Math.max((initialInvestment / grossExitTotal) * 100, 0);
    const feeWidth = Math.max((feeCost / grossExitTotal) * 100, 0);
    const taxWidth = Math.max((taxAmount / grossExitTotal) * 100, 0);
    const profitWidth = isNetGain
        ? Math.max((netProfit / grossExitTotal) * 100, 0)
        : 0;

    // Loss-case capital preservation proportions
    const retainedWidth = initialInvestment > 0
        ? Math.max(Math.min((totalExitValue / initialInvestment) * 100, 100), 0)
        : 0;
    const lossWidth = Math.max(100 - retainedWidth, 0);

    return (
        <section className={styles.container} aria-label="Tax and fee breakdown chart">
            <div className={styles.header}>
                <h3 className={styles.title}>
                    {symbol ? `${symbol} Proceeds & Drag Breakdown` : 'Proceeds & Drag Breakdown'}
                </h3>
                <span className={styles.totalProceeds}>
                    Net Exit Proceeds (Take-Home): <span className={styles.totalProceedsValue}>{formatTaxCurrency(totalExitValue)}</span>
                </span>
            </div>

            {/* Stacked relative breakdown bar */}
            <div
                className={styles.barTrack}
                role="img"
                aria-label={
                    isGrossGain
                        ? isNetGain
                            ? `Proceeds breakdown: Cost basis ${formatTaxCurrency(initialInvestment)}, Fees ${formatTaxCurrency(feeCost)}, Taxes ${formatTaxCurrency(taxAmount)}, Net profit ${formatTaxCurrency(netProfit)}`
                            : `Proceeds breakdown: Cost basis ${formatTaxCurrency(initialInvestment)}, Fees ${formatTaxCurrency(feeCost)}, Taxes ${formatTaxCurrency(taxAmount)}, Net loss ${formatTaxCurrency(Math.abs(netProfit))}`
                        : `Capital preservation breakdown: Retained capital ${formatTaxCurrency(totalExitValue)}, Net capital loss ${formatTaxCurrency(Math.abs(netProfit))}`
                }
            >
                {isGrossGain ? (
                    <>
                        <div
                            className={`${styles.barSegment} ${styles.basisSegment}`}
                            style={{ width: `${basisWidth}%` }}
                            title={`Cost Basis: ${formatTaxCurrency(initialInvestment)} (${basisWidth.toFixed(1)}%)`}
                        />
                        {feeWidth > 0 && (
                            <div
                                className={`${styles.barSegment} ${styles.feeSegment}`}
                                style={{ width: `${feeWidth}%` }}
                                title={`Fees Drag: ${formatTaxCurrency(feeCost)} (${feeWidth.toFixed(1)}%)`}
                            />
                        )}
                        {taxWidth > 0 && (
                            <div
                                className={`${styles.barSegment} ${styles.taxSegment}`}
                                style={{ width: `${taxWidth}%` }}
                                title={`Taxes Drag: ${formatTaxCurrency(taxAmount)} (${taxWidth.toFixed(1)}%)`}
                            />
                        )}
                        {profitWidth > 0 && isNetGain && (
                            <div
                                className={`${styles.barSegment} ${styles.profitSegment}`}
                                style={{ width: `${profitWidth}%` }}
                                title={`Net Profit: ${formatTaxCurrency(netProfit)} (${profitWidth.toFixed(1)}%)`}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <div
                            className={`${styles.barSegment} ${styles.basisSegment}`}
                            style={{ width: `${retainedWidth}%` }}
                            title={`Retained Capital: ${formatTaxCurrency(totalExitValue)} (${retainedWidth.toFixed(1)}%)`}
                        />
                        <div
                            className={`${styles.barSegment} ${styles.lossSegment}`}
                            style={{ width: `${lossWidth}%` }}
                            title={`Net Capital Loss: ${formatTaxCurrency(Math.abs(netProfit))} (${lossWidth.toFixed(1)}%)`}
                        />
                    </>
                )}
            </div>

            {/* 4 Key Institutional Stat Cards */}
            <div className={styles.legendGrid}>
                <div className={styles.legendCard}>
                    <div className={styles.legendLabelRow}>
                        <span className={styles.dot} style={{ backgroundColor: '#64748b' }} />
                        <span className={styles.cardLabel}>Cost Basis</span>
                    </div>
                    <span className={styles.cardValue}>
                        {formatTaxCurrency(initialInvestment)}
                    </span>
                </div>

                <div className={styles.legendCard}>
                    <div className={styles.legendLabelRow}>
                        <span className={styles.dot} style={{ backgroundColor: '#f59e0b' }} />
                        <span className={styles.cardLabel}>Fee Drag</span>
                    </div>
                    <span className={`${styles.cardValue} ${styles.feeText}`}>
                        {feeCost > 0 ? `-${formatTaxCurrency(feeCost)}` : formatTaxCurrency(0)}
                    </span>
                </div>

                <div className={styles.legendCard}>
                    <div className={styles.legendLabelRow}>
                        <span className={styles.dot} style={{ backgroundColor: '#8b5cf6' }} />
                        <span className={styles.cardLabel}>Tax Drag</span>
                    </div>
                    <span className={`${styles.cardValue} ${styles.taxText}`}>
                        {taxAmount > 0 ? `-${formatTaxCurrency(taxAmount)}` : formatTaxCurrency(0)}
                    </span>
                </div>

                <div className={styles.legendCard}>
                    <div className={styles.legendLabelRow}>
                        <span
                            className={styles.dot}
                            style={{ backgroundColor: netProfit >= 0 ? 'var(--gain, #10b981)' : 'var(--loss, #ef4444)' }}
                        />
                        <span className={styles.cardLabel}>{netProfit >= 0 ? 'Net Retained' : 'Net Loss'}</span>
                    </div>
                    <span
                        className={`${styles.cardValue} ${netProfit >= 0 ? styles.gainText : styles.lossText}`}
                    >
                        {netProfit >= 0 ? `+${formatTaxCurrency(netProfit)}` : formatTaxCurrency(netProfit)}
                    </span>
                </div>
            </div>

            {/* Drag Efficiency Analysis */}
            <div className={styles.efficiencyBanner}>
                <span>
                    Frictions Impact: <strong className={styles.efficiencyValue}>{totalDrag > 0 ? `-${formatTaxCurrency(totalDrag)}` : formatTaxCurrency(0)}</strong> total friction drag
                </span>
                <span>
                    Gain Retention: <strong className={styles.efficiencyValue}>
                        {isNetGain ? `${(100 - dragPercentage).toFixed(1)}%` : '0.0%'} retained
                    </strong>
                </span>
            </div>
        </section>
    );
};

export default TaxBreakdownChart;
