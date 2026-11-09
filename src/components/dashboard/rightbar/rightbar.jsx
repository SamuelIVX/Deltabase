'use client'; 
/**
 * Dashboard right rail — Finnhub news list and promotional callouts.
 */
import styles from "./rightbar.module.css";
import { FaArrowTrendUp } from "react-icons/fa6";
import useFinnhubNews from "@/hooks/useFinnhubNews"

/**
 * Right rail with Finnhub news feed and static promo blocks.
 * @returns {JSX.Element}
 */
const Rightbar = () => {
  const { data, isPending, isError } = useFinnhubNews();
  const articles = Array.isArray(data) ? data.slice(0, 1) : [];

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.text}>
          <span className={styles.notification}>Total Balance</span>
          <h3 className={styles.balance}>
            $148,601
          </h3>
          <span className={styles.positive}> <FaArrowTrendUp /> +18% from last week</span>
        </div>
      </div>

      <div className={styles.item}>
        <div className={styles.text}>
          <span className={styles.notification}>🚀 Newsletter Of The Day</span>
          {isPending && <p className={styles.desc}>Loading market news...</p>}
          {isError && <p className={styles.desc}>Unable to load news right now.</p>}
          {!isPending && !isError && articles.map((article) => (
               <div key={article.id}>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.image && article.image.trim() !== '' ? (
                      <img 
                        src={article.image} 
                        alt={article.headline || "News article"} 
                        className={styles.image}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        📰
                      </div>
                    )}
                  </a>
                  <h3 className={styles.title}>{article.headline}</h3>
                  <span className={styles.subtitle}>- {article.source}</span>
                  <p className={styles.desc}>{article.summary}</p>
               </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rightbar;
