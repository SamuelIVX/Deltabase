import styles from "@/components/dashboard/dashboard.module.css";
import Card from "@/components/dashboard/card/card";
import Rightbar from "@/components/dashboard/rightbar/rightbar";
import Chart from "@/components/dashboard/chart/chart"

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