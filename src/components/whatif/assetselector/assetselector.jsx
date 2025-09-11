'use client'
import { useState } from 'react'
import useFinnhubStockSymbols from '@/hooks/useFinnhubStockSymbol';
import styles from "./assetselector.module.css";

const AssetSelector = () => {
    const [searchTerm1, setSearchTerm1] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');

    const [selectedAsset1, setSelectedAsset1] = useState(null);
    const [selectedAsset2, setSelectedAsset2] = useState(null);

    const {results: results1, isLoading: isLoading1, error: error1} = useFinnhubStockSymbols(searchTerm1);
    const {results: results2, isLoading: isLoading2, error: error2} = useFinnhubStockSymbols(searchTerm2);

    const handleSelectAsset1 = (stock) => {
        setSelectedAsset1(stock);
        setSearchTerm1(stock.symbol);
    }

    const handleSelectAsset2 = (stock) => {
        setSelectedAsset2(stock);
        setSearchTerm2(stock.symbol);
    }

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
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm1(value)
                        // Clear selection as soon as the input diverges from the selected symbol
                        if (selectedAsset1 && value !== selectedAsset1.symbol) {
                            setSelectedAsset1(null);
                        }
                    }}
                    />
                </div>

                {isLoading1 && <p>Loading...</p>}
                {error1 && <p>An error occured: {error1}</p>}

                {!selectedAsset1 && results1.map(stock => (
                    <div 
                    className={styles.output}
                    key={stock.symbol}
                    onClick={() => handleSelectAsset1(stock)}
                    >
                        {stock.symbol} - {stock.description}
                    </div>
                ))}

                {selectedAsset1 && (
                    <div className={styles.selected}>
                            Selected: {selectedAsset1.symbol} - {selectedAsset1.description}
                    </div>
                )}
            </div>

            <div className={styles.container}>
            <span className={styles.title}>Asset 2</span>
                <div className={styles.search}>
                    <input
                    className={styles.input}
                    type = 'text'
                    placeholder="Enter a stock symbol..."
                    value={searchTerm2}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm2(value)
                        // Clear selection as soon as the input diverges from the selected symbol
                        if (selectedAsset2 && value !== selectedAsset2.symbol) {
                            setSelectedAsset2(null);
                        }
                    }}
                    />
                </div>

                {isLoading2 && <p>Loading...</p>}
                {error2 && <p>An error occured: {error2}</p>}

                {!selectedAsset2 && results2.map(stock => (
                    <div 
                    className={styles.output}
                    key={stock.symbol}
                    onClick={() => handleSelectAsset2(stock)}
                    >
                        {stock.symbol} - {stock.description}
                    </div>
                ))}

                {selectedAsset2 && (
                    <div className={styles.selected}>
                            Selected: {selectedAsset2.symbol} - {selectedAsset2.description}
                    </div>
                )}
            </div>

        </div>
    )
}

export default AssetSelector;