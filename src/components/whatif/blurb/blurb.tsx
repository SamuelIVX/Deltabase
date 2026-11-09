/**
 * Modern institutional header blurb for What-If DCA investment simulator.
 */
import styles from "./blurb.module.css";

/**
 * Top headline and description for What-If simulator.
 * @returns {JSX.Element}
 */
const Blurb = () => {
    return (
        <div className={styles.container}>
            <div className={styles.badgeRow}>
                <span className={styles.badge}>Backtest Engine</span>
                <span className={styles.tagline}>Institutional DCA Modeling</span>
            </div>
            <h1 className={styles.title}>What-If Investment Calculator</h1>
            <p className={styles.description}>
                Simulate disciplined dollar-cost averaging and measure historical opportunity cost between any two equities, index ETFs, or digital assets.
            </p>
        </div>
    );
};

export default Blurb;
