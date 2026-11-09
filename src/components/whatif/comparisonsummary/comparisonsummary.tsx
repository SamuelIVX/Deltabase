'use client';
/**
 * What-If comparison summary scorecard — head-to-head metrics, opportunity cost, and returns matrix.
 */
import { useContext } from 'react';
import { AssetContext } from '@/components/whatif/assetselector/assetselector';
import styles from './comparisonsummary.module.css';

const formatMoney = (val: number | string | null | undefined): string =>
    (Number(val) || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

/**
 * Summarizes DCA performance totals, alpha spread, and opportunity cost between the two assets.
 * @returns {JSX.Element}
 */
const ComparisonSummary = () => {
    const {
        asset1Data,
        asset2Data,
        selectedAsset1,
        selectedAsset2,
        initialInvestment1,
        monthlyInvestment1,
        initialInvestment2,
        monthlyInvestment2,
        value1
    } = useContext(AssetContext);

    if (
        !asset1Data || !asset2Data ||
        !asset1Data.length || !asset2Data.length ||
        !selectedAsset1 || !selectedAsset2 ||
        !initialInvestment1 || !monthlyInvestment1 ||
        !initialInvestment2 || !monthlyInvestment2
    ) {
        return <div></div>;
    }

    const lastPt1 = asset1Data[asset1Data.length - 1];
    const lastPt2 = asset2Data[asset2Data.length - 1];

    const asset1Final = Number(lastPt1?.portfolioValue) || 0;
    const asset2Final = Number(lastPt2?.portfolioValue) || 0;

    const invested1 = Number(lastPt1?.invested) ||
        (Number(initialInvestment1) + Number(monthlyInvestment1) * (asset1Data.length - 1));
    const invested2 = Number(lastPt2?.invested) ||
        (Number(initialInvestment2) + Number(monthlyInvestment2) * (asset2Data.length - 1));

    const profit1 = asset1Final - invested1;
    const profit2 = asset2Final - invested2;

    const returnPct1 = invested1 > 0 ? (profit1 / invested1) * 100 : 0;
    const returnPct2 = invested2 > 0 ? (profit2 / invested2) * 100 : 0;

    const years = (value1 && value1[0]) || Math.max(1, Math.round(asset1Data.length / 12));

    const cagr1 = invested1 > 0 && asset1Final > 0
        ? (Math.pow(asset1Final / invested1, 1 / years) - 1) * 100
        : 0;
    const cagr2 = invested2 > 0 && asset2Final > 0
        ? (Math.pow(asset2Final / invested2, 1 / years) - 1) * 100
        : 0;

    // Difference (opportunity cost from perspective of Asset 1 vs Asset 2)
    const difference = asset2Final - asset1Final;
    const betterAsset = difference > 0 ? selectedAsset2 : selectedAsset1;
    const winnerReturn = difference > 0 ? returnPct2 : returnPct1;

    const sym1 = selectedAsset1?.symbol;
    const sym2 = selectedAsset2?.symbol;

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <span className={styles.badge}>Scorecard</span>
                        <h3 className={styles.title}>What-If Analysis Results</h3>
                    </div>
                    <div className={styles.winnerPill}>
                        <span className={styles.winnerTrophy} aria-hidden="true">★</span>
                        <span>Leader: <strong>{betterAsset?.symbol}</strong></span>
                    </div>
                </div>

                {/* Alpha Callout Card */}
                <div className={`${styles.alphaCard} ${difference > 0 ? styles.alphaCost : styles.alphaSave}`}>
                    <p className={styles.summary}>
                        Choosing <strong className={styles.symbolHighlight}>{sym1}</strong> over <strong className={styles.symbolHighlight}>{sym2}</strong> would have:
                    </p>
                    <p className={`${styles.costAmount} ${difference > 0 ? styles.costNegative : styles.costPositive}`}>
                        <strong>{difference > 0 ? 'Cost you' : 'Saved you'} ${formatMoney(Math.abs(difference))}</strong>
                    </p>
                    <div className={styles.verdictLine}>
                        <span className={styles.betterChoice}>You would have been better off investing in </span>
                        <span><strong className={styles.winnerHighlight}>{betterAsset?.symbol}</strong></span>
                        <span className={styles.verdictNote}>({winnerReturn >= 0 ? '+' : ''}{winnerReturn.toFixed(1)}% total gain)</span>.
                    </div>
                </div>

                {/* Head-to-Head Comparison Table */}
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col" className={styles.thMetric}>Performance Metric</th>
                                <th scope="col" className={styles.thAsset}>
                                    <span className={styles.dotAsset1} aria-hidden="true" />
                                    <span>{sym1}</span>
                                </th>
                                <th scope="col" className={styles.thAsset}>
                                    <span className={styles.dotAsset2} aria-hidden="true" />
                                    <span>{sym2}</span>
                                </th>
                                <th scope="col" className={styles.thDelta}>Delta / Spread</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={styles.tdLabel}>Final Portfolio Value</td>
                                <td className={`${styles.tdVal} ${difference < 0 ? styles.cellWinner : ''}`}>
                                    Ending: ${formatMoney(asset1Final)}
                                </td>
                                <td className={`${styles.tdVal} ${difference > 0 ? styles.cellWinner : ''}`}>
                                    Ending: ${formatMoney(asset2Final)}
                                </td>
                                <td className={styles.tdDelta}>
                                    <span className={difference !== 0 ? styles.spreadBadge : ''}>
                                        {difference > 0 ? `+${sym2} by $${formatMoney(difference)}` : difference < 0 ? `+${sym1} by $${formatMoney(Math.abs(difference))}` : 'Even'}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className={styles.tdLabel}>Total Capital Invested</td>
                                <td className={styles.tdVal}>${formatMoney(invested1)}</td>
                                <td className={styles.tdVal}>${formatMoney(invested2)}</td>
                                <td className={styles.tdDelta}>
                                    ${formatMoney(Math.abs(invested2 - invested1))}
                                </td>
                            </tr>
                            <tr>
                                <td className={styles.tdLabel}>Total Net Profit</td>
                                <td className={`${styles.tdVal} ${profit1 >= 0 ? styles.gainText : styles.lossText}`}>
                                    {profit1 >= 0 ? '+' : ''}${formatMoney(profit1)}
                                </td>
                                <td className={`${styles.tdVal} ${profit2 >= 0 ? styles.gainText : styles.lossText}`}>
                                    {profit2 >= 0 ? '+' : ''}${formatMoney(profit2)}
                                </td>
                                <td className={styles.tdDelta}>
                                    ${formatMoney(Math.abs(profit2 - profit1))}
                                </td>
                            </tr>
                            <tr>
                                <td className={styles.tdLabel}>Total Return (%)</td>
                                <td className={`${styles.tdVal} ${returnPct1 >= 0 ? styles.gainText : styles.lossText}`}>
                                    {returnPct1 >= 0 ? '+' : ''}{returnPct1.toFixed(2)}%
                                </td>
                                <td className={`${styles.tdVal} ${returnPct2 >= 0 ? styles.gainText : styles.lossText}`}>
                                    {returnPct2 >= 0 ? '+' : ''}{returnPct2.toFixed(2)}%
                                </td>
                                <td className={styles.tdDelta}>
                                    {Math.abs(returnPct2 - returnPct1).toFixed(2)}%
                                </td>
                            </tr>
                            <tr>
                                <td className={styles.tdLabel}>Annualized Return (CAGR)</td>
                                <td className={styles.tdVal}>{cagr1.toFixed(2)}%</td>
                                <td className={styles.tdVal}>{cagr2.toFixed(2)}%</td>
                                <td className={styles.tdDelta}>{Math.abs(cagr2 - cagr1).toFixed(2)}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Narrative Breakdown (Preserves Exact Text for Compatibility) */}
                <div className={styles.narrativeSection}>
                    <div className={styles.narrativeCard}>
                        <p>
                            For <strong className={styles.symbolHighlight}>{sym1}</strong> with an initial investment of{' '}
                            <strong className={styles.amountHighlight}>${formatMoney(initialInvestment1)}</strong> and monthly contributions of{' '}
                            <strong className={styles.amountHighlight}>${formatMoney(monthlyInvestment1)}</strong>:
                        </p>
                        <p className={styles.narrativeFinal}>
                            Final Value: <strong className={styles.finalHighlight}>${formatMoney(asset1Final)}</strong>
                        </p>
                    </div>

                    <div className={styles.narrativeCard}>
                        <p>
                            For <strong className={styles.symbolHighlight}>{sym2}</strong> with an initial investment of{' '}
                            <strong className={styles.amountHighlight}>${formatMoney(initialInvestment2)}</strong> and monthly contributions of{' '}
                            <strong className={styles.amountHighlight}>${formatMoney(monthlyInvestment2)}</strong>:
                        </p>
                        <p className={styles.narrativeFinal}>
                            Final Value: <strong className={styles.finalHighlight}>${formatMoney(asset2Final)}</strong>
                        </p>
                    </div>
                </div>

                <hr className={styles.divider} />

                <p className={styles.disclaimer}>
                    Disclaimer:
                    The results are based on historical data and simulations. Past performance is not indicative of future results. Always consider your risk tolerance and investment goals before making financial decisions.
                    This tool is for educational purposes only and does not constitute financial advice. Consult with a financial advisor for personalized investment guidance.
                </p>
            </div>
        </div>
    );
};

export default ComparisonSummary;
