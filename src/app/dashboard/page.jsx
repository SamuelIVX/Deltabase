/**
 * Dashboard home — overview cards and placeholder chart for the retail investor UI.
 */
import styles from "@/components/dashboard/dashboard.module.css";
import Card from "@/components/dashboard/card/card";
import Rightbar from "@/components/dashboard/rightbar/rightbar";
import Chart from "@/components/dashboard/chart/chart"

/** Dashboard home composing Card, Chart, and Rightbar panels. */
const Dashboard = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.cards}>
          <Card />
        </div>
        <Chart />
      </div>
      <div className={styles.side}>
        <Rightbar />
      </div>
    </div>
  );
};

export default Dashboard;