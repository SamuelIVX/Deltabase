import styles from "./comparisoncharts.module.css";
import Chart1 from "./charts/chart1";
import Chart2 from "./charts/chart2";

const ComparisonCharts = () => {
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