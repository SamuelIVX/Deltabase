'use client';
/**
 * What-If comparison charts container — mounts the unified dual-asset DCA performance chart.
 */
import React from 'react';
import styles from "./comparisoncharts.module.css";
import { AssetContext } from "../assetselector/assetselector";
import UnifiedComparisonChart from "./UnifiedComparisonChart";

/**
 * Layout wrapper rendering the unified dual-asset comparative DCA chart.
 * @returns {JSX.Element}
 */
const ComparisonCharts = () => {
    const {
        selectedAsset1,
        initialInvestment1,
        monthlyInvestment1,
        selectedAsset2,
        initialInvestment2,
        monthlyInvestment2,
    } = React.useContext(AssetContext);

    if (!selectedAsset1 || !initialInvestment1 || !monthlyInvestment1 || !selectedAsset2 || !initialInvestment2 || !monthlyInvestment2) {
        return (
            <div className={styles.unselected}>
                <p>
                    Please select both assets and enter initial &amp; monthly investment amounts to view the{' '}
                    <strong>comparative performance chart</strong> and <strong>opportunity cost summary</strong>.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <UnifiedComparisonChart />
        </div>
    );
};

export default ComparisonCharts;
