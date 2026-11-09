/**
 * Dashboard home — live macro benchmark cards, S&P 500 interactive chart, and market intelligence news.
 */
import React from "react";
import styles from "@/components/dashboard/dashboard.module.css";
import MacroCards from "@/components/dashboard/macro/MacroCards";
import MarketBenchmarkChart from "@/components/dashboard/macro/MarketBenchmarkChart";
import Rightbar from "@/components/dashboard/rightbar/rightbar";

/**
 * Dashboard home composing live MacroCards, MarketBenchmarkChart, and Rightbar news feed.
 * @returns {JSX.Element}
 */
const Dashboard = (): React.JSX.Element => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.cards}>
          <MacroCards />
        </div>
        <MarketBenchmarkChart />
      </div>
      <div className={styles.side}>
        <Rightbar />
      </div>
    </div>
  );
};

export default Dashboard;
