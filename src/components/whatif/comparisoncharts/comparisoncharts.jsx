'use client';
import { AssetContext } from "../assetselector/assetselector";
import React from 'react';
import styles from "./comparisoncharts.module.css";
import Chart1 from "./charts/chart1";
import Chart2 from "./charts/chart2";

const ComparisonCharts = () => {
    const { selectedAsset1, selectedAsset2, value, initialInvestment, monthlyInvestment } = React.useContext(AssetContext);

    if (!selectedAsset1 || !selectedAsset2 || !value || !initialInvestment || !monthlyInvestment) {
        return <div
            className={styles.unselected}>
            <p className={styles.message}>Please fill out all necessary fields to see the respective charts.</p>
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