'use client';
/**
 * Single unified dual-asset comparative DCA performance chart.
 * Merges Asset 1 vs Asset 2 and baseline invested principal into a single Recharts AreaChart
 * with translucent fills, hover-dimming series focus, and glassmorphic tooltip.
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    AreaChart,
    Area,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import { MoonLoader } from 'react-spinners';
import styles from './charts/charts.module.css';
import { AssetContext } from '@/components/whatif/assetselector/assetselector';
import useYahooHistoricalData from '@/hooks/useYahooHistoricalData';
import useSimulateDCA from '@/hooks/useSimulateDCA';
import type { UnifiedDCAPoint } from '@/types/whatif';

const formatCurrencyVal = (val: number | null | undefined): string => {
    if (val == null || !Number.isFinite(val)) return '0.00';
    return (Number(val) || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        name?: string;
        value?: number;
        dataKey?: string;
        payload?: UnifiedDCAPoint;
    }>;
    label?: string;
    asset1Symbol?: string;
    asset2Symbol?: string;
}

/**
 * Glassmorphic custom tooltip for What-If comparative chart.
 * Renders date, values, return percentages, and leader spread.
 */
export const CustomWhatIfTooltip = ({
    active,
    payload,
    label,
    asset1Symbol,
    asset2Symbol,
}: TooltipProps) => {
    if (!active || !payload?.length) return null;
    const pt = payload[0]?.payload;
    if (!pt) return null;

    const val1 = pt.portfolioValue1;
    const val2 = pt.portfolioValue2;
    const invested1 = pt.invested1 ?? pt.invested;
    const invested2 = pt.invested2 ?? pt.invested;
    const invested = pt.invested ?? (invested1 === invested2 ? invested1 : null);

    const gain1 = val1 != null && invested1 != null ? val1 - invested1 : null;
    const gain1Pct = gain1 != null && invested1 && invested1 > 0 ? (gain1 / invested1) * 100 : null;

    const gain2 = val2 != null && invested2 != null ? val2 - invested2 : null;
    const gain2Pct = gain2 != null && invested2 && invested2 > 0 ? (gain2 / invested2) * 100 : null;

    const diff = val1 != null && val2 != null ? val1 - val2 : null;
    const leader = diff != null ? (diff > 0 ? asset1Symbol : asset2Symbol) : null;

    return (
        <div className={styles.glassTooltip}>
            <div className={styles.tooltipDate}>{label || pt.name}</div>

            {val1 != null && (
                <div className={styles.tooltipRow}>
                    <div className={styles.tooltipLabel}>
                        <span className={styles.dotAsset1} />
                        <span>{asset1Symbol || 'Asset 1'}</span>
                    </div>
                    <div className={styles.tooltipValues}>
                        <span className={styles.tooltipValue}>${formatCurrencyVal(val1)}</span>
                        {gain1Pct != null && (
                            <span className={gain1 && gain1 >= 0 ? styles.gainPill : styles.lossPill}>
                                {gain1 && gain1 >= 0 ? '+' : ''}{gain1Pct.toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>
            )}

            {val2 != null && (
                <div className={styles.tooltipRow}>
                    <div className={styles.tooltipLabel}>
                        <span className={styles.dotAsset2} />
                        <span>{asset2Symbol || 'Asset 2'}</span>
                    </div>
                    <div className={styles.tooltipValues}>
                        <span className={styles.tooltipValue}>${formatCurrencyVal(val2)}</span>
                        {gain2Pct != null && (
                            <span className={gain2 && gain2 >= 0 ? styles.gainPill : styles.lossPill}>
                                {gain2 && gain2 >= 0 ? '+' : ''}{gain2Pct.toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>
            )}

            {invested != null ? (
                <div className={styles.tooltipRowMuted}>
                    <div className={styles.tooltipLabel}>
                        <span className={styles.dotInvested} />
                        <span>Invested Principal</span>
                    </div>
                    <span className={styles.tooltipMutedValue}>${formatCurrencyVal(invested)}</span>
                </div>
            ) : invested1 != null && invested2 != null ? (
                <div className={styles.tooltipRowMuted}>
                    <div className={styles.tooltipLabel}>
                        <span className={styles.dotInvested} />
                        <span>Invested Principal</span>
                    </div>
                    <span className={styles.tooltipMutedValue}>
                        ${formatCurrencyVal(invested1)} / ${formatCurrencyVal(invested2)}
                    </span>
                </div>
            ) : null}

            {diff != null && Math.abs(diff) > 0.01 && (
                <div className={styles.tooltipSpread}>
                    <span className={styles.spreadLabel}>Spread</span>
                    <span className={diff >= 0 ? styles.tooltipSpreadAsset1 : styles.tooltipSpreadAsset2}>
                        {leader} leads by ${formatCurrencyVal(Math.abs(diff))}
                    </span>
                </div>
            )}
        </div>
    );
};

/**
 * Unified comparison chart combining Asset 1 and Asset 2 DCA simulations.
 */
const UnifiedComparisonChart = () => {
    const {
        selectedAsset1, value1, initialInvestment1, monthlyInvestment1, asset1Data, setAsset1Data,
        selectedAsset2, value2, initialInvestment2, monthlyInvestment2, asset2Data, setAsset2Data
    } = useContext(AssetContext);

    // Hover state for interactive series focus / dimming: null | 'asset1' | 'asset2'
    const [hoveredSeries, setHoveredSeries] = useState<'asset1' | 'asset2' | null>(null);

    const { results: results1, isLoading: isLoading1, error: error1 } = useYahooHistoricalData(
        selectedAsset1?.symbol || '',
        String(value1[0] || 1)
    );

    const { results: results2, isLoading: isLoading2, error: error2 } = useYahooHistoricalData(
        selectedAsset2?.symbol || '',
        String(value2[0] || 1)
    );

    const dca1 = useSimulateDCA(results1, Number(initialInvestment1) || 0, Number(monthlyInvestment1) || 0);
    const dca2 = useSimulateDCA(results2, Number(initialInvestment2) || 0, Number(monthlyInvestment2) || 0);

    // Keep AssetContext synchronized for external consumers (e.g. ComparisonSummary)
    useEffect(() => {
        if (dca1.monthlyPortfolio && dca1.monthlyPortfolio.length > 0) {
            setAsset1Data(dca1.monthlyPortfolio);
        } else if ((!results1 || results1.length === 0) && asset1Data.length > 0) {
            setAsset1Data([]);
        }
    }, [dca1.monthlyPortfolio, results1, asset1Data.length, setAsset1Data]);

    useEffect(() => {
        if (dca2.monthlyPortfolio && dca2.monthlyPortfolio.length > 0) {
            setAsset2Data(dca2.monthlyPortfolio);
        } else if ((!results2 || results2.length === 0) && asset2Data.length > 0) {
            setAsset2Data([]);
        }
    }, [dca2.monthlyPortfolio, results2, asset2Data.length, setAsset2Data]);

    // Align both monthly portfolios into a single chronological series
    const chartData = useMemo(() => {
        const map = new Map<string, UnifiedDCAPoint>();

        const p1 = dca1.monthlyPortfolio || [];
        const p2 = dca2.monthlyPortfolio || [];

        p1.forEach((item) => {
            map.set(item.name, {
                name: item.name,
                displayDate: item.name.length >= 7 ? item.name.slice(0, 7) : item.name,
                portfolioValue1: Number(item.portfolioValue),
                invested1: Number(item.invested),
                invested: Number(item.invested),
                adjclose1: item.adjclose,
            });
        });

        p2.forEach((item) => {
            const existing = map.get(item.name);
            if (existing) {
                existing.portfolioValue2 = Number(item.portfolioValue);
                existing.invested2 = Number(item.invested);
                if (existing.invested == null) existing.invested = Number(item.invested);
                existing.adjclose2 = item.adjclose;
            } else {
                map.set(item.name, {
                    name: item.name,
                    displayDate: item.name.length >= 7 ? item.name.slice(0, 7) : item.name,
                    portfolioValue2: Number(item.portfolioValue),
                    invested2: Number(item.invested),
                    invested: Number(item.invested),
                    adjclose2: item.adjclose,
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [dca1.monthlyPortfolio, dca2.monthlyPortfolio]);

    const asset1Symbol = selectedAsset1?.symbol || 'Asset 1';
    const asset2Symbol = selectedAsset2?.symbol || 'Asset 2';

    const latestPoint = chartData[chartData.length - 1];
    const finalVal1 = latestPoint?.portfolioValue1 ?? dca1.finalValue;
    const finalVal2 = latestPoint?.portfolioValue2 ?? dca2.finalValue;
    const finalInvested = latestPoint?.invested ?? dca1.totalInvested;

    const returnPct1 = finalInvested > 0 ? ((finalVal1 - finalInvested) / finalInvested) * 100 : 0;
    const returnPct2 = finalInvested > 0 ? ((finalVal2 - finalInvested) / finalInvested) * 100 : 0;

    const isLoading = isLoading1 || isLoading2;
    const error = error1 || error2;

    return (
        <div className={styles.chartWrapper}>
            {/* Chart Header & Interactive Legend */}
            <div className={styles.chartHeader}>
                <div className={styles.chartTitleGroup}>
                    <h3 className={styles.chartHeading}>Comparative DCA Portfolio Value</h3>
                    <span className={styles.chartSubheading}>
                        Monthly accumulated value vs total principal invested
                    </span>
                </div>

                <div className={styles.interactiveLegend} aria-label="Interactive Chart Legend">
                    <button
                        type="button"
                        className={`${styles.legendPill} ${hoveredSeries === 'asset1' ? styles.legendPillActive : ''}`}
                        onMouseEnter={() => setHoveredSeries('asset1')}
                        onMouseLeave={() => setHoveredSeries(null)}
                        onFocus={() => setHoveredSeries('asset1')}
                        onBlur={() => setHoveredSeries(null)}
                        aria-label={`Focus ${asset1Symbol}`}
                    >
                        <span className={styles.dotAsset1} aria-hidden="true" />
                        <span className={styles.legendSymbol}>{asset1Symbol}</span>
                        <span className={styles.legendValue}>${formatCurrencyVal(finalVal1)}</span>
                        <span className={returnPct1 >= 0 ? styles.gainText : styles.lossText}>
                            ({returnPct1 >= 0 ? '+' : ''}{returnPct1.toFixed(1)}%)
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.legendPill} ${hoveredSeries === 'asset2' ? styles.legendPillActive : ''}`}
                        onMouseEnter={() => setHoveredSeries('asset2')}
                        onMouseLeave={() => setHoveredSeries(null)}
                        onFocus={() => setHoveredSeries('asset2')}
                        onBlur={() => setHoveredSeries(null)}
                        aria-label={`Focus ${asset2Symbol}`}
                    >
                        <span className={styles.dotAsset2} aria-hidden="true" />
                        <span className={styles.legendSymbol}>{asset2Symbol}</span>
                        <span className={styles.legendValue}>${formatCurrencyVal(finalVal2)}</span>
                        <span className={returnPct2 >= 0 ? styles.gainText : styles.lossText}>
                            ({returnPct2 >= 0 ? '+' : ''}{returnPct2.toFixed(1)}%)
                        </span>
                    </button>

                    <div className={styles.legendPrincipal} title="Total capital contributed">
                        <span className={styles.dashInvested} aria-hidden="true" />
                        <span className={styles.legendSymbol}>Invested</span>
                        <span className={styles.legendMutedValue}>${formatCurrencyVal(finalInvested)}</span>
                    </div>
                </div>
            </div>

            {/* Error or Loading Overlays */}
            {error && <p className={styles.errorMessage}>Historical data error: {error}</p>}
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <MoonLoader color="var(--primary)" size={60} />
                </div>
            )}

            {/* Recharts Area Chart */}
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={420}>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 15, left: 10, bottom: 24 }}
                    >
                        <defs>
                            <linearGradient id="asset1Grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--asset-1)" stopOpacity={hoveredSeries === 'asset1' ? 0.35 : 0.18} />
                                <stop offset="95%" stopColor="var(--asset-1)" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="asset2Grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--asset-2)" stopOpacity={hoveredSeries === 'asset2' ? 0.35 : 0.18} />
                                <stop offset="95%" stopColor="var(--asset-2)" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.6} />

                        <XAxis
                            dataKey="displayDate"
                            minTickGap={45}
                            tick={{ fill: 'var(--textSoft)', fontSize: 11 }}
                            axisLine={{ stroke: 'var(--border)' }}
                            tickLine={false}
                            dy={6}
                        />

                        <YAxis
                            domain={[(dataMin: number) => Math.floor(dataMin * 0.95), (dataMax: number) => Math.ceil(dataMax * 1.05)]}
                            tickFormatter={(val: number) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                            tick={{ fill: 'var(--textSoft)', fontSize: 11 }}
                            axisLine={{ stroke: 'var(--border)' }}
                            tickLine={false}
                            orientation="right"
                        />

                        <Tooltip
                            content={
                                <CustomWhatIfTooltip
                                    asset1Symbol={asset1Symbol}
                                    asset2Symbol={asset2Symbol}
                                />
                            }
                        />

                        {/* Baseline: Total Invested Principal */}
                        <Line
                            type="monotone"
                            dataKey="invested"
                            stroke="var(--benchmark)"
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            strokeOpacity={hoveredSeries ? 0.3 : 0.65}
                            dot={false}
                            activeDot={false}
                            name="Total Invested"
                        />

                        {/* Area 1: Asset 1 */}
                        <Area
                            type="monotone"
                            dataKey="portfolioValue1"
                            stroke="var(--asset-1)"
                            fill="url(#asset1Grad)"
                            strokeWidth={hoveredSeries === 'asset1' ? 3 : hoveredSeries === 'asset2' ? 1.5 : 2}
                            strokeOpacity={hoveredSeries === 'asset2' ? 0.25 : 1}
                            fillOpacity={hoveredSeries === 'asset2' ? 0.02 : hoveredSeries === 'asset1' ? 0.3 : 0.14}
                            onMouseEnter={() => setHoveredSeries('asset1')}
                            onMouseLeave={() => setHoveredSeries(null)}
                            name={asset1Symbol}
                        />

                        {/* Area 2: Asset 2 */}
                        <Area
                            type="monotone"
                            dataKey="portfolioValue2"
                            stroke="var(--asset-2)"
                            fill="url(#asset2Grad)"
                            strokeWidth={hoveredSeries === 'asset2' ? 3 : hoveredSeries === 'asset1' ? 1.5 : 2}
                            strokeOpacity={hoveredSeries === 'asset1' ? 0.25 : 1}
                            fillOpacity={hoveredSeries === 'asset1' ? 0.02 : hoveredSeries === 'asset2' ? 0.3 : 0.14}
                            onMouseEnter={() => setHoveredSeries('asset2')}
                            onMouseLeave={() => setHoveredSeries(null)}
                            name={asset2Symbol}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default UnifiedComparisonChart;
