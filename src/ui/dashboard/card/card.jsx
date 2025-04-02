import { MdSupervisedUserCircle } from "react-icons/md";
import styles from "./card.module.css";

const Card = () => {
  return (
    <div className={styles.container}>
      <MdSupervisedUserCircle size={24} />
      <div className={styles.texts}>
        <span className={styles.title}>Active Users</span>
        <span className={styles.number}>10,273 Users</span>
        <span className={styles.detail}>
          <span className={styles.positive}>34%</span> more than previous week
        </span>
      </div>
    </div>
  );
};

export default Card;