/**
 * Dashboard footer with product credit / copyright line.
 */
import styles from "./footer.module.css";

/**
 * Dashboard footer credit line.
 * @returns {JSX.Element}
 */
const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>Samuel Hernandez Balderas</div>
      <div className={styles.text}>All rights reserved.</div>
    </div>
  );
};

export default Footer;
