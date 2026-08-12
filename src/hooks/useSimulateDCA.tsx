import { useMemo } from "react";
import {
    simulateDCA,
    type DCAResult,
    type DCAResultItem,
} from "@/utils/simulateDCA";

const useSimulateDCA = (results: DCAResultItem[], initialInvestment: number, monthlyInvestment: number): DCAResult => {
    return useMemo(
        () => simulateDCA(results, initialInvestment, monthlyInvestment),
        [results, initialInvestment, monthlyInvestment]
    );
};

export default useSimulateDCA;
