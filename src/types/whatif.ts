/**
 * Type definitions for What-If DCA investment simulator.
 */

/** Selected asset item from search or preset */
export interface AssetItem {
    symbol: string;
    shortname?: string;
    longname?: string;
    name?: string;
}

/** 1-click comparison preset */
export interface ComparisonPreset {
    id: string;
    label: string;
    asset1: AssetItem;
    asset2: AssetItem;
    initialInvestment: string;
    monthlyInvestment: string;
    years: number;
}

/** One month of simulated DCA portfolio history for a single asset */
export interface MonthlyPortfolioPoint {
    name: string;
    portfolioValue: string;
    invested: string;
    adjclose: number;
}

/** Context shape passed to What-If child components */
export interface AssetContextType {
    selectedAsset1: AssetItem | null;
    setSelectedAsset1: (asset: AssetItem | null) => void;
    value1: number[];
    setValue1: (val: number[]) => void;
    initialInvestment1: string;
    setInitialInvestment1: (val: string) => void;
    monthlyInvestment1: string;
    setMonthlyInvestment1: (val: string) => void;
    asset1Data: MonthlyPortfolioPoint[];
    setAsset1Data: (data: MonthlyPortfolioPoint[]) => void;

    selectedAsset2: AssetItem | null;
    setSelectedAsset2: (asset: AssetItem | null) => void;
    value2: number[];
    setValue2: (val: number[]) => void;
    initialInvestment2: string;
    setInitialInvestment2: (val: string) => void;
    monthlyInvestment2: string;
    setMonthlyInvestment2: (val: string) => void;
    asset2Data: MonthlyPortfolioPoint[];
    setAsset2Data: (data: MonthlyPortfolioPoint[]) => void;
}

/** Unified monthly point combining both assets and baseline */
export interface UnifiedDCAPoint {
    name: string; // date YYYY-MM-DD
    displayDate: string; // YYYY-MM
    portfolioValue1?: number;
    portfolioValue2?: number;
    invested1?: number;
    invested2?: number;
    invested?: number;
    adjclose1?: number;
    adjclose2?: number;
}
