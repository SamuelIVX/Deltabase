import React, { useContext } from 'react';
import { AssetContext } from '@/components/whatif/assetselector/assetselector';
import styles from './comparisonsummary.module.css';

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
    const asset1Final = asset1Data[asset1Data.length - 1]?.portfolioValue || 0;
    const asset2Final = asset2Data[asset2Data.length - 1]?.portfolioValue || 0;

    // Difference (opportunity cost)
    const difference = asset2Final - asset1Final;
    const betterAsset = difference > 0 ? selectedAsset2 : selectedAsset1;

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>

                <h3 className={styles.title}>What-If Analysis Results</h3>

                <div className={styles.content}>
                    <p>
                        For <strong style={{ color: 'silver' }}>{selectedAsset1?.symbol}</strong> with an initial investment of
                        <strong style={{ color: 'beige' }}> ${initialInvestment1.toLocaleString()}</strong> and monthly contributions of
                        <strong style={{ color: 'beige' }}> ${monthlyInvestment1.toLocaleString()}</strong>:
                        <br />
                        Final Value: <strong style={{ color: 'gold' }}>${asset1Final.toLocaleString()}</strong>
                    </p>

                    <p>
                        For <strong style={{ color: 'silver' }}>{selectedAsset2?.symbol}</strong> with an initial investment of
                        <strong style={{ color: 'beige' }}> ${initialInvestment2.toLocaleString()}</strong> and monthly contributions of
                        <strong style={{ color: 'beige' }}> ${monthlyInvestment2.toLocaleString()}</strong>:
                        <br />
                        Final Value: <strong style={{ color: 'gold' }}>${asset2Final.toLocaleString()}</strong>
                    </p>

                    <p className={styles.summary}>
                        Choosing <strong style={{ color: 'silver' }}>{selectedAsset1?.symbol}</strong> over <strong style={{ color: 'silver' }}>{selectedAsset2?.symbol}</strong> would have:
                    </p>

                    <p className={styles.costAmount} style={{ color: difference > 0 ? 'red' : 'green' }}>
                        <strong>{difference > 0 ? 'Cost you' : 'Saved you'} ${Math.abs(difference).toLocaleString()}</strong>
                    </p>

                    <div>
                        <span className={styles.betterChoice}> You would have been better off investing in </span>
                        <span><strong style={{ color: 'green' }}>{betterAsset?.symbol}</strong>.</span>
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
