'use client'
/**
 * What-If asset pickers (stock/crypto) and shared AssetContext default export site.
 * Declares AssetContext consumed across What-If child components.
 */
import { createContext, useContext, useState } from 'react'
import styles from "./assetselector.module.css";
import useYahooStockSymbols from '@/hooks/useYahooStockSymbols';
import useDebounce from '@/hooks/useDebounce';

/**
 * Cross-component What-If state (selected assets, investments, horizon).
 * Provided by `whatif/page.jsx`; consumed by selector/form/charts/summary.
 */
export const AssetContext = createContext({
    selectedAsset1: null,
    setSelectedAsset1: () => { },
    selectedAsset2: null,
    setSelectedAsset2: () => { },
    value1: [1],
    setValue1: () => { },
    initialInvestment1: "",
    setInitialInvestment1: () => { },
    monthlyInvestment1: "",
    setMonthlyInvestment1: () => { },
    value2: [1],
    setValue2: () => { },
    initialInvestment2: "",
    setInitialInvestment2: () => { },
    monthlyInvestment2: "",
    setMonthlyInvestment2: () => { },
    asset1Data: [],
    setAsset1Data: () => { },
    asset2Data: [],
    setAsset2Data: () => { },
});

/**
 * Dual asset search/select UI bound to AssetContext.
 * @returns {JSX.Element}
 * @example
 * <AssetSelector />
 */
const AssetSelector = () => {
    const [searchTerm1, setSearchTerm1] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');
    const debouncedSearchTerm1 = useDebounce(searchTerm1, 500);
    const debouncedSearchTerm2 = useDebounce(searchTerm2, 500);

    const { selectedAsset1, setSelectedAsset1, selectedAsset2, setSelectedAsset2 } = useContext(AssetContext);

    const { results: results1, isLoading: isLoading1, error: error1 } = useYahooStockSymbols(debouncedSearchTerm1);
    const { results: results2, isLoading: isLoading2, error: error2 } = useYahooStockSymbols(debouncedSearchTerm2);

    const [focusedIndex1, setFocusedIndex1] = useState(0);
    const [focusedIndex2, setFocusedIndex2] = useState(0);

    const safeFocusedIndex1 = focusedIndex1 < results1.length ? focusedIndex1 : 0;
    const safeFocusedIndex2 = focusedIndex2 < results2.length ? focusedIndex2 : 0;

    const handleSelectAsset1 = (stock) => {
        setSelectedAsset1(stock);
        setSearchTerm1(stock.symbol);
    }

    const handleSelectAsset2 = (stock) => {
        setSelectedAsset2(stock);
        setSearchTerm2(stock.symbol);
    }

    const handleKeyDown1 = (e, index, stock) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectAsset1(stock);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = Math.min(results1.length - 1, index + 1);
            setFocusedIndex1(next);
            const nextEl = e.currentTarget.parentElement?.children[next];
            if (nextEl instanceof HTMLElement) nextEl.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = Math.max(0, index - 1);
            setFocusedIndex1(prev);
            const prevEl = e.currentTarget.parentElement?.children[prev];
            if (prevEl instanceof HTMLElement) prevEl.focus();
        }
    };

    const handleKeyDown2 = (e, index, stock) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectAsset2(stock);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = Math.min(results2.length - 1, index + 1);
            setFocusedIndex2(next);
            const nextEl = e.currentTarget.parentElement?.children[next];
            if (nextEl instanceof HTMLElement) nextEl.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = Math.max(0, index - 1);
            setFocusedIndex2(prev);
            const prevEl = e.currentTarget.parentElement?.children[prev];
            if (prevEl instanceof HTMLElement) prevEl.focus();
        }
    };

    const handleInputKeyDown1 = (e) => {
        if (e.key === 'ArrowDown' && results1.length > 0) {
            e.preventDefault();
            setFocusedIndex1(0);
            const firstOption = e.currentTarget.closest(`.${styles.container}`)?.querySelector('[role="option"]');
            if (firstOption instanceof HTMLElement) firstOption.focus();
        }
    };

    const handleInputKeyDown2 = (e) => {
        if (e.key === 'ArrowDown' && results2.length > 0) {
            e.preventDefault();
            setFocusedIndex2(0);
            const firstOption = e.currentTarget.closest(`.${styles.container}`)?.querySelector('[role="option"]');
            if (firstOption instanceof HTMLElement) firstOption.focus();
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <span className={styles.title}>Asset 1</span>
                <div className={styles.search}>
                    <input
                        className={styles.input}
                        type='text'
                        placeholder="Enter a stock symbol..."
                        aria-label="Search symbol for Asset 1"
                        value={searchTerm1}
                        onKeyDown={handleInputKeyDown1}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchTerm1(value);
                            setFocusedIndex1(0);
                            // Clear selection as soon as the input diverges from the selected symbol
                            if (selectedAsset1 && value !== selectedAsset1.symbol) {
                                setSelectedAsset1(null);
                            }
                        }}
                    />
                </div>

                {isLoading1 && <p className={styles.statusText}>Loading results...</p>}
                {error1 && <p className={styles.statusText}>An error occurred: {error1}</p>}

                {/* Asset 1 results */}
                {!selectedAsset1 && results1.length > 0 && (
                    <div className={styles.dropdown} role="listbox" aria-label="Asset 1 results">
                        {results1.map((stock, index) => (
                            <div
                                key={`${stock.symbol || stock.name}-${index}`}
                                className={styles.output}
                                role="option"
                                aria-selected={selectedAsset1?.symbol === stock.symbol}
                                tabIndex={safeFocusedIndex1 === index ? 0 : -1}
                                onClick={() => handleSelectAsset1(stock)}
                                onKeyDown={(e) => handleKeyDown1(e, index, stock)}
                            >
                                {stock.symbol ? `${stock.symbol} - ${stock.shortname || stock.longname}` : stock.name}
                            </div>
                        ))}
                    </div>
                )}

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
                        aria-label="Search symbol for Asset 2"
                        value={searchTerm2}
                        onKeyDown={handleInputKeyDown2}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchTerm2(value);
                            setFocusedIndex2(0);
                            // Clear selection as soon as the input diverges from the selected symbol
                            if (selectedAsset2 && value !== selectedAsset2.symbol) {
                                setSelectedAsset2(null);
                            }
                        }}
                    />
                </div>

                {isLoading2 && <p className={styles.statusText}>Loading results...</p>}
                {error2 && <p className={styles.statusText}>An error occurred: {error2}</p>}

                {/* Asset 2 results */}
                {!selectedAsset2 && results2.length > 0 && (
                    <div className={styles.dropdown} role="listbox" aria-label="Asset 2 results">
                        {results2.map((stock, index) => (
                            <div
                                key={`${stock.symbol || stock.name}-${index}`}
                                className={styles.output}
                                role="option"
                                aria-selected={selectedAsset2?.symbol === stock.symbol}
                                tabIndex={safeFocusedIndex2 === index ? 0 : -1}
                                onClick={() => handleSelectAsset2(stock)}
                                onKeyDown={(e) => handleKeyDown2(e, index, stock)}
                            >
                                {stock.symbol ? `${stock.symbol} - ${stock.shortname || stock.longname}` : stock.name}
                            </div>
                        ))}
                    </div>
                )}

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