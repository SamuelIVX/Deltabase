/**
 * Dashboard footer with institutional compliance disclaimer and copyright.
 */
import React from "react";
import styles from "./footer.module.css";

/**
 * Institutional compliance footer for DeltaBase.
 * @returns {JSX.Element}
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.brandGroup}>
          <span className={styles.brandTitle}>DeltaBase</span>
          <span className={styles.badge}>v0.1.0</span>
        </div>
        <div className={styles.copyright}>
          &copy; {currentYear} Samuel Hernandez Balderas. All rights reserved.
        </div>
      </div>
      <p className={styles.disclaimer}>
        Market data, quotes, and projections are provided for informational and educational
        purposes only and should not be construed as financial, legal, or tax advice. Past
        performance is no guarantee of future returns.
      </p>
    </footer>
  );
};

export default Footer;
