'use client';
/**
 * What-If asset pickers (stock/crypto), quick comparison presets, and shared AssetContext.
 * Declares AssetContext consumed across What-If child components.
 */
import { createContext, useContext, useState } from 'react';
import styles from "./assetselector.module.css";
import useYahooStockSymbols from '@/hooks/useYahooStockSymbols';
import useDebounce from '@/hooks/useDebounce';
import { COMPARISON_PRESETS } from '../presets';
import type { AssetItem, AssetContextType, ComparisonPreset } from '@/types/whatif';

/**
 * Cross-component What-If state (selected assets, investments, horizon).
 * Provided by `whatif/page.tsx`; consumed by selector/form/charts/summary.
 */
export const AssetContext = createContext<AssetContextType>({
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
 * Dual asset search/select UI bound to AssetContext with 1-click comparison presets.
 * @returns {JSX.Element}
 */
const AssetSelector = () => {
    const {
        selectedAsset1, setSelectedAsset1,
        selectedAsset2, setSelectedAsset2,
        setInitialInvestment1, setInitialInvestment2,
        setMonthlyInvestment1, setMonthlyInvestment2,
        setValue1, setValue2
    } = useContext(AssetContext);

    const [searchTerm1, setSearchTerm1] = useState(selectedAsset1?.symbol || '');
    const [searchTerm2, setSearchTerm2] = useState(selectedAsset2?.symbol || '');
    const debouncedSearchTerm1 = useDebounce(searchTerm1, 500);
    const debouncedSearchTerm2 = useDebounce(searchTerm2, 500);

    const { results: results1, isLoading: isLoading1, error: error1 } = useYahooStockSymbols(debouncedSearchTerm1);
    const { results: results2, isLoading: isLoading2, error: error2 } = useYahooStockSymbols(debouncedSearchTerm2);

    const [focusedIndex1, setFocusedIndex1] = useState(0);
    const [focusedIndex2, setFocusedIndex2] = useState(0);

    const safeFocusedIndex1 = focusedIndex1 < results1.length ? focusedIndex1 : 0;
    const safeFocusedIndex2 = focusedIndex2 < results2.length ? focusedIndex2 : 0;



    const handleSelectAsset1 = (stock: AssetItem) => {
        setSelectedAsset1(stock);
        setSearchTerm1(stock.symbol);
    };

    const handleSelectAsset2 = (stock: AssetItem) => {
        setSelectedAsset2(stock);
        setSearchTerm2(stock.symbol);
    };

    const handleApplyPreset = (preset: ComparisonPreset) => {
        setSelectedAsset1(preset.asset1);
        setSelectedAsset2(preset.asset2);
        setSearchTerm1(preset.asset1.symbol);
        setSearchTerm2(preset.asset2.symbol);
        setInitialInvestment1(preset.initialInvestment);
        setInitialInvestment2(preset.initialInvestment);
        setMonthlyInvestment1(preset.monthlyInvestment);
        setMonthlyInvestment2(preset.monthlyInvestment);
        setValue1([preset.years]);
        setValue2([preset.years]);
    };

    const handleKeyDown1 = (e: React.KeyboardEvent, index: number, stock: AssetItem) => {
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

    const handleKeyDown2 = (e: React.KeyboardEvent, index: number, stock: AssetItem) => {
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

    const handleInputKeyDown1 = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown' && results1.length > 0) {
            e.preventDefault();
            setFocusedIndex1(0);
            const firstOption = e.currentTarget.closest(`.${styles.container}`)?.querySelector('[role="option"]');
            if (firstOption instanceof HTMLElement) firstOption.focus();
        } else if (e.key === 'Enter' && results1.length > 0) {
            e.preventDefault();
            const first = results1[0];
            handleSelectAsset1({
                symbol: first.symbol,
                name: first.shortname || first.longname || first.symbol,
                shortname: first.shortname,
                longname: first.longname,
            });
        }
    };

    const handleInputKeyDown2 = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown' && results2.length > 0) {
            e.preventDefault();
            setFocusedIndex2(0);
            const firstOption = e.currentTarget.closest(`.${styles.container}`)?.querySelector('[role="option"]');
            if (firstOption instanceof HTMLElement) firstOption.focus();
        } else if (e.key === 'Enter' && results2.length > 0) {
            e.preventDefault();
            const first = results2[0];
            handleSelectAsset2({
                symbol: first.symbol,
                name: first.shortname || first.longname || first.symbol,
                shortname: first.shortname,
                longname: first.longname,
            });
        }
    };

    return (
        <div className={styles.section}>
            {/* 1-Click Comparison Presets */}
            <div className={styles.presetsBar} aria-label="Quick DCA Comparison Presets">
                <span className={styles.presetsLabel}>Popular Comparisons:</span>
                <div className={styles.presetChips}>
                    {COMPARISON_PRESETS.map((preset) => {
                        const isMatch =
                            selectedAsset1?.symbol === preset.asset1.symbol &&
                            selectedAsset2?.symbol === preset.asset2.symbol;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                className={`${styles.presetChip} ${isMatch ? styles.presetChipActive : ''}`}
                                onClick={() => handleApplyPreset(preset)}
                                aria-pressed={isMatch}
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.wrapper}>
                {/* Asset 1 Container */}
                <div className={styles.container}>
                    <div className={styles.headerRow}>
                        <div className={styles.titleGroup}>
                            <span className={styles.dotAsset1} aria-hidden="true" />
                            <span className={styles.title}>Asset 1</span>
                        </div>
                        {selectedAsset1 && (
                            <button
                                type="button"
                                className={styles.changeBtn}
                                onClick={() => {
                                    setSelectedAsset1(null);
                                    setSearchTerm1('');
                                }}
                                aria-label="Change Asset 1"
                            >
                                Change
                            </button>
                        )}
                    </div>

                    <div className={styles.search}>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Enter a stock or ETF symbol (e.g. SPY)..."
                            aria-label="Search symbol for Asset 1"
                            value={searchTerm1}
                            onKeyDown={handleInputKeyDown1}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchTerm1(value);
                                setFocusedIndex1(0);
                                if (selectedAsset1 && value !== selectedAsset1.symbol) {
                                    setSelectedAsset1(null);
                                }
                            }}
                        />
                    </div>

                    {isLoading1 && <p className={styles.statusText}>Searching market tickers...</p>}
                    {error1 && <p className={styles.statusError}>An error occurred: {error1}</p>}

                    {/* Dropdown 1 */}
                    {!selectedAsset1 && results1.length > 0 && (
                        <div className={styles.dropdown} role="listbox" aria-label="Asset 1 results">
                            {results1.map((stock: AssetItem, index: number) => (
                                <div
                                    key={`${stock.symbol || stock.name}-${index}`}
                                    className={styles.output}
                                    role="option"
                                    aria-selected={false}
                                    tabIndex={safeFocusedIndex1 === index ? 0 : -1}
                                    onClick={() => handleSelectAsset1(stock)}
                                    onKeyDown={(e) => handleKeyDown1(e, index, stock)}
                                >
                                    <span className={styles.outputSymbol}>{stock.symbol || stock.name}</span>
                                    <span className={styles.outputName}>{stock.shortname || stock.longname}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedAsset1 && (
                        <div className={styles.selected}>
                            <span className={styles.selectedBadge}>Selected</span>
                            <span className={styles.selectedSymbol}>{selectedAsset1.symbol}</span>
                            <span className={styles.selectedName}>{selectedAsset1.shortname || selectedAsset1.longname || ''}</span>
                        </div>
                    )}
                </div>

                {/* VS Divider Badge */}
                <div className={styles.vsBadge} aria-hidden="true">
                    <span>VS</span>
                </div>

                {/* Asset 2 Container */}
                <div className={styles.container}>
                    <div className={styles.headerRow}>
                        <div className={styles.titleGroup}>
                            <span className={styles.dotAsset2} aria-hidden="true" />
                            <span className={styles.title}>Asset 2</span>
                        </div>
                        {selectedAsset2 && (
                            <button
                                type="button"
                                className={styles.changeBtn}
                                onClick={() => {
                                    setSelectedAsset2(null);
                                    setSearchTerm2('');
                                }}
                                aria-label="Change Asset 2"
                            >
                                Change
                            </button>
                        )}
                    </div>

                    <div className={styles.search}>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="Enter a stock or ETF symbol (e.g. QQQ)..."
                            aria-label="Search symbol for Asset 2"
                            value={searchTerm2}
                            onKeyDown={handleInputKeyDown2}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchTerm2(value);
                                setFocusedIndex2(0);
                                if (selectedAsset2 && value !== selectedAsset2.symbol) {
                                    setSelectedAsset2(null);
                                }
                            }}
                        />
                    </div>

                    {isLoading2 && <p className={styles.statusText}>Searching market tickers...</p>}
                    {error2 && <p className={styles.statusError}>An error occurred: {error2}</p>}

                    {/* Dropdown 2 */}
                    {!selectedAsset2 && results2.length > 0 && (
                        <div className={styles.dropdown} role="listbox" aria-label="Asset 2 results">
                            {results2.map((stock: AssetItem, index: number) => (
                                <div
                                    key={`${stock.symbol || stock.name}-${index}`}
                                    className={styles.output}
                                    role="option"
                                    aria-selected={false}
                                    tabIndex={safeFocusedIndex2 === index ? 0 : -1}
                                    onClick={() => handleSelectAsset2(stock)}
                                    onKeyDown={(e) => handleKeyDown2(e, index, stock)}
                                >
                                    <span className={styles.outputSymbol}>{stock.symbol || stock.name}</span>
                                    <span className={styles.outputName}>{stock.shortname || stock.longname}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedAsset2 && (
                        <div className={styles.selected}>
                            <span className={styles.selectedBadge}>Selected</span>
                            <span className={styles.selectedSymbol}>{selectedAsset2.symbol}</span>
                            <span className={styles.selectedName}>{selectedAsset2.shortname || selectedAsset2.longname || ''}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetSelector;
