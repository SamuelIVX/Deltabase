'use client'; 
import styles from "./rightbar.module.css";
import { FaArrowTrendUp } from "react-icons/fa6";
import useFinnhubNews from "@/hooks/useFinnhubNews"

const Rightbar = () => {
  const {data, isPending, isError, error} = useFinnhubNews();
  if(isPending) { return <div>Loading...</div> };
  if(isError) { return <div>Error: {error.message}</div> };

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.bgContainer}>
        </div>
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
          {data.slice(0,1).map((article) => (
               <div key={article.id}>
                  <a href={article.url}>
                    <img 
                      src= {article.image} 
                      alt="" 
                      className={styles.image}
                    />
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
