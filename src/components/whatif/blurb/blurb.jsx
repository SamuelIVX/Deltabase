import styles from "./blurb.module.css";

const Blurb = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>What-If Investment Calculator</h1>
            <p className={styles.description}>This is a tool that allows you to compare your initial investment between two different assets. </p>
            <p className={styles.description}>You can select the initial investment, the time period, and the asset you want to invest in.</p>
        </div>
    )
}

export default Blurb;