import styles from "@/ui/dashboard/dashboard.module.css";
import Card from "@/ui/dashboard/card/card";
import Rightbar from "@/ui/dashboard/rightbar/rightbar";
import Chart from "@/ui/dashboard/chart/chart"

const Dashboard = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.cards}>
          <Card />
          {/* <Card />
          <Card /> */}
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