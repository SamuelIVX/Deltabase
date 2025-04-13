import styles from "./rightbar.module.css";
import { MdReadMore } from "react-icons/md";
import { FaArrowTrendUp } from "react-icons/fa6";


const Rightbar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.bgContainer}>
        </div>
        <div className={styles.text}>
          <span className={styles.notification}>Total Balance</span>
          <h3 className={styles.title}>
            $148,601
          </h3>
          <span className={styles.positive}> <FaArrowTrendUp /> +18% from last week</span>
        </div>
      </div>

      <div className={styles.item}>
        <div className={styles.text}>
          <span className={styles.notification}>🚀 Newsletter Of The Day</span>
          <h3 className={styles.title}>
            How server actions are available, partial pre-rendering is coming
            up!
          </h3>
          <span className={styles.subtitle}>Boost your productivity</span>
          <p className={styles.desc}>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
          </p>
          <button className={styles.button}>
            <MdReadMore />
            Learn
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rightbar;
