'use client';
/**
 * What-If comparison charts container — mounts the two side-by-side DCA series charts.
 */
import { AssetContext } from "../assetselector/assetselector";
import React from 'react';
import styles from "./comparisoncharts.module.css";
import Chart1 from "./charts/chart1";
import Chart2 from "./charts/chart2";

/**
 * Layout wrapper rendering Chart1 and Chart2 side by side.
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
        return <div
            className={styles.unselected}>
            <p>Please fill out all necessary fields to see the <strong>respective charts</strong> and the <strong>comparison summary</strong>.</p>
        </div>;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <Chart1 />
            </div>

            <div className={styles.container}>
                <Chart2 />
            </div>
        </div>
    )
}

export default ComparisonCharts;