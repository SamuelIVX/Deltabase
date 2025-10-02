'use client'
import { createContext, useContext, useState } from 'react'
import styles from "./assetselector.module.css";
import useYahooStockSymbols from '@/hooks/useYahooStockSymbols';

export const AssetContext = createContext({
    selectedAsset1: null,
    setSelectedAsset1: (value) => { },
    selectedAsset2: null,
    setSelectedAsset2: (value) => { },
    value1: [1],
    setValue1: (value) => { },
    initialInvestment1: "",
    setInitialInvestment1: (value) => { },
    monthlyInvestment1: "",
    setMonthlyInvestment1: (value) => { },
    value2: [1],
    setValue2: (value) => { },
    initialInvestment2: "",
    setInitialInvestment2: (value) => { },
    monthlyInvestment2: "",
    setMonthlyInvestment2: (value) => { },
    asset1Data: [],
    setAsset1Data: (value) => { },
    asset2Data: [],
    setAsset2Data: (value) => { },
});

const AssetSelector = () => {
    const [searchTerm1, setSearchTerm1] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');

    const { selectedAsset1, setSelectedAsset1, selectedAsset2, setSelectedAsset2 } = useContext(AssetContext);

    const { results: results1, isLoading: isLoading1, error: error1 } = useYahooStockSymbols(searchTerm1);
    const { results: results2, isLoading: isLoading2, error: error2 } = useYahooStockSymbols(searchTerm2);


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
                        type='text'
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

                {isLoading1 && <p>Loading results...</p>}
                {error1 && <p>An error occured: {error1}</p>}

                {/* Asset 1 results */}
                {!selectedAsset1 && results1.length > 0 && results1.map((stock, index) => (
                    <div
                        key={`${stock.symbol || stock.name}-${index}`}
                        className={styles.output}
                        onClick={() => handleSelectAsset1(stock)}
                    >
                        {stock.symbol ? `${stock.symbol} - ${stock.shortname || stock.longname}` : stock.name}
                    </div>
                ))}

                {selectedAsset1 && (
                    <div className={styles.selected}>
                        Selected: {selectedAsset1.symbol} - {selectedAsset1.shortname}
                    </div>
                )}

            </div>

            <div className={styles.container}>
                <span className={styles.title}>Asset 2</span>
                <div className={styles.search}>
                    <input
                        className={styles.input}
                        type='text'
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

                {/* Asset 2 results */}
                {!selectedAsset2 && results2.length > 0 && results2.map((stock, index) => (
                    <div
                        key={`${stock.symbol || stock.name}-${index}`}
                        className={styles.output}
                        onClick={() => handleSelectAsset2(stock)}
                    >
                        {stock.symbol ? `${stock.symbol} - ${stock.shortname || stock.longname}` : stock.name}
                    </div>
                ))}

                {selectedAsset2 && (
                    <div className={styles.selected}>
                        Selected: {selectedAsset2.symbol} - {selectedAsset2.shortname}
                    </div>
                )}

            </div>
        </div>
    )
}

export default AssetSelector;