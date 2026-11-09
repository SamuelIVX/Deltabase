/**
 * What-If summary cards — totals, gain, and opportunity-cost between the two assets.
 */
import React, { useContext } from 'react';
import { AssetContext } from '@/components/whatif/assetselector/assetselector';
import styles from './comparisonsummary.module.css';

/**
 * Summarizes DCA totals and opportunity cost between the two assets.
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
        monthlyInvestment2
    } = useContext(AssetContext);

    if (
        !asset1Data || !asset2Data ||
        !selectedAsset1 || !selectedAsset2 ||
        !initialInvestment1 || !monthlyInvestment1 ||
        !initialInvestment2 || !monthlyInvestment2
    ) {
        return <div></div>;
    }

    // Calculate final values
    const asset1Final = Number(asset1Data[asset1Data.length - 1]?.portfolioValue) || 0;
    const asset2Final = Number(asset2Data[asset2Data.length - 1]?.portfolioValue) || 0;

    // Difference (opportunity cost)
    const difference = asset2Final - asset1Final;
    const betterAsset = difference > 0 ? selectedAsset2 : selectedAsset1;

    const formatMoney = (val) =>
        (Number(val) || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>

                <h3 className={styles.title}>What-If Analysis Results</h3>

                <div className={styles.content}>
                    <p>
                        For <strong className={styles.symbolHighlight}>{selectedAsset1?.symbol}</strong> with an initial investment of
                        <strong className={styles.amountHighlight}> ${formatMoney(initialInvestment1)}</strong> and monthly contributions of
                        <strong className={styles.amountHighlight}> ${formatMoney(monthlyInvestment1)}</strong>:
                        <br />
                        Final Value: <strong className={styles.finalHighlight}>${formatMoney(asset1Final)}</strong>
                    </p>

                    <p>
                        For <strong className={styles.symbolHighlight}>{selectedAsset2?.symbol}</strong> with an initial investment of
                        <strong className={styles.amountHighlight}> ${formatMoney(initialInvestment2)}</strong> and monthly contributions of
                        <strong className={styles.amountHighlight}> ${formatMoney(monthlyInvestment2)}</strong>:
                        <br />
                        Final Value: <strong className={styles.finalHighlight}>${formatMoney(asset2Final)}</strong>
                    </p>

                    <p className={styles.summary}>
                        Choosing <strong className={styles.symbolHighlight}>{selectedAsset1?.symbol}</strong> over <strong className={styles.symbolHighlight}>{selectedAsset2?.symbol}</strong> would have:
                    </p>

                    <p className={`${styles.costAmount} ${difference > 0 ? styles.costNegative : styles.costPositive}`}>
                        <strong>{difference > 0 ? 'Cost you' : 'Saved you'} ${formatMoney(Math.abs(difference))}</strong>
                    </p>

                    <div>
                        <span className={styles.betterChoice}> You would have been better off investing in </span>
                        <span><strong className={styles.winnerHighlight}>{betterAsset?.symbol}</strong>.</span>
                    </div>

                    <hr />

                    <p className={styles.disclaimer}>
                        Disclaimer:
                        The results are based on historical data and simulations. Past performance is not indicative of future results. Always consider your risk tolerance and investment goals before making financial decisions.
                        This tool is for educational purposes only and does not constitute financial advice. Consult with a financial advisor for personalized investment guidance.
                    </p>

                </div>
            </div>
        </div>
    )
}

export default ComparisonSummary;
