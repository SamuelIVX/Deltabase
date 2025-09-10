'use client'
import { useState } from 'react'
import useFinnhubStockSymbols from '@/hooks/useFinnhubStockSymbol';
import styles from "./assetselector.module.css";

const AssetSelector = () => {
    const [searchTerm1, setSearchTerm1] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');

    const {results: results1, isLoading: isLoading1, error: error1} = useFinnhubStockSymbols(searchTerm1);
    const {results: results2, isLoading: isLoading2, error: error2} = useFinnhubStockSymbols(searchTerm2);

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
            <span className={styles.title}>Asset 1</span>
                <div className={styles.search}>
                    <input
                    className={styles.input}
                    type = 'text'
                    placeholder="Enter a stock symbol..."
                    value={searchTerm1}
                    onChange={(e) => setSearchTerm1(e.target.value)}
                    />
                </div>

                {isLoading1 && <p>Loading...</p>}
                {error1 && <p>An error occured: {error1}</p>}
                {results1.map(stock => (
                    <div 
                    className={styles.output}
                    key={stock.symbol}
                    >
                        {stock.symbol} - {stock.description}
                    </div>
                ))}
            </div>

            <div className={styles.container}>
            <span className={styles.title}>Asset 2</span>
                <div className={styles.search}>
                    <input
                    className={styles.input}
                    type = 'text'
                    placeholder="Enter a stock symbol..."
                    value={searchTerm2}
                    onChange={(e) => setSearchTerm2(e.target.value)}
                    />
                </div>

                {isLoading2 && <p>Loading...</p>}
                {error2 && <p>An error occured: {error2}</p>}
                {results2.map(stock => (
                    <div key={stock.symbol}>
                        {stock.symbol} - {stock.description}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AssetSelector;