'use client'; 

import { FaApple } from "react-icons/fa";
import { BsAmazon, BsNvidia } from "react-icons/bs";
import styles from "./card.module.css";
import useFinnhubStocks from "@/hooks/useFinnhubStocks"

const stockSymbols = [
  {symbol : 'AAPL', Icon : FaApple},
  {symbol : 'AAPL', Icon : BsAmazon},
  {symbol : 'AAPL', Icon : BsNvidia}
]

const Card = () => {

  const symbols = stockSymbols.map((sym) => { sym.symbol });
  const {data, isPending, isError, error} = useFinnhubStocks(symbols);
  if(isPending) { return <div>Loading...</div> };
  if(isError) { return <div>Error: {error.message}</div> };
  console.log(data);

  return (
      <div className={styles.container}>
        <FaApple size={24} />
        <div className={styles.texts}>
          <span className={styles.title}>Apple Inc</span>
          <span className={styles.number}>10,273 Users</span>
          <span className={styles.detail}>
            <span className={styles.positive}>34%</span> more than previous week
          </span>
        </div>
      </div>
      
    // <>
    // <div className={styles.container}>
    //   <FaApple size={24} />
    //   <div className={styles.texts}>
    //     <span className={styles.title}>Apple Inc</span>
    //     <span className={styles.number}>10,273 Users</span>
    //     <span className={styles.detail}>
    //       <span className={styles.positive}>34%</span> more than previous week
    //     </span>
    //   </div>
    // </div>

    // <div className={styles.container}>
    //   <BsAmazon size={24} />
    //   <div className={styles.texts}>
    //     <span className={styles.title}>Amazon Inc</span>
    //     <span className={styles.number}>10,273 Users</span>
    //     <span className={styles.detail}>
    //       <span className={styles.positive}>34%</span> more than previous week
    //     </span>
    //   </div>
    // </div>

    // <div className={styles.container}>
    //   <BsNvidia size={24} />
    //   <div className={styles.texts}>
    //     <span className={styles.title}>Nvidia</span>
    //     <span className={styles.number}>10,273 Users</span>
    //     <span className={styles.detail}>
    //       <span className={styles.positive}>34%</span> more than previous week
    //     </span>
    //   </div>
    // </div>
    // </>
  );
};

export default Card;