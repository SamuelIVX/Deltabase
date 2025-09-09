import { FaPiggyBank, FaMoneyBillWave } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa6";
import styles from "./card.module.css";

const Card = () => {
    return (
      <>
      <div className={styles.container}>
        <FaUserTie size={24} />
        <div className={styles.texts}>
          <span className={styles.title}>Total Portfolio Value</span>
          <span className={styles.number}>$63,097</span>
          <span className={styles.detail}>
            <span className={styles.positive}>23.12%</span> more than previous week
          </span>
        </div>
      </div>

      <div className={styles.container}>
        <FaPiggyBank size={24} />
        <div className={styles.texts}>
          <span className={styles.title}>Available to Invest</span>
          <span className={styles.number}>$24,120</span>
          <span className={styles.detail}>
            <span className={styles.positive}>11.98%</span> more than previous week
          </span>
        </div>
      </div>

      <div className={styles.container}>
        <FaMoneyBillWave size={24} />
        <div className={styles.texts}>
          <span className={styles.title}>Top Gainer</span>
          <span className={styles.number}>AAPL</span>
          <span className={styles.detail}>
            <span className={styles.positive}>4.58%</span> more than previous week
          </span>
        </div>
      </div>
      </>
    );
};

export default Card;