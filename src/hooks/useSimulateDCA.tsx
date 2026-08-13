/**
 * Memoized wrapper around {@link simulateDCA} for What-If portfolio projections.
 */
import { useMemo } from "react";
import {
    simulateDCA,
    type DCAResult,
    type DCAResultItem,
} from "@/utils/simulateDCA";

/**
 * Recomputes DCA totals when price history or investment amounts change.
 * @param results - Monthly price rows for one asset.
 * @param initialInvestment - Lump-sum dollars at the first valid price.
 * @param monthlyInvestment - Recurring dollars at each valid price.
 * @returns Memoized {@link DCAResult}.
 * @example
 * const dca = useSimulateDCA(priceHistory, 1000, 100);
 */
const useSimulateDCA = (results: DCAResultItem[], initialInvestment: number, monthlyInvestment: number): DCAResult => {
    return useMemo(
        () => simulateDCA(results, initialInvestment, monthlyInvestment),
        [results, initialInvestment, monthlyInvestment]
    );
};

export default useSimulateDCA;
