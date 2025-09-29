import { useMemo } from "react";

const useSimulateDCA = (results, initialInvestment, monthlyInvestment) => {
    return useMemo(() => {
        let totalShares = 0;
        let totalInvested = 0;
        const monthlyPortfolio = [];

        results.forEach((item, idx) => {
            const price = Number(item.adjclose);
            if (!price || isNaN(price)) return; // skip if price is invalid

            // Initial investment at first month
            if (idx === 0 && initialInvestment > 0) {
                totalShares += initialInvestment / price;
                totalInvested += Number(initialInvestment);
            }
            // Monthly investment
            if (monthlyInvestment > 0) {
                totalShares += monthlyInvestment / price;
                totalInvested += Number(monthlyInvestment);
            }
            monthlyPortfolio.push({
                name: item.date.slice(0, 10),
                portfolioValue: (totalShares * price).toFixed(2),
                invested: totalInvested.toFixed(2),
                adjclose: price
            });
        });

        const finalValue = totalShares * (results.length > 0 ? Number(results[results.length - 1].adjclose) : 0);
        const gain = finalValue - totalInvested;

        return {
            totalShares,
            totalInvested,
            finalValue,
            gain,
            monthlyPortfolio
        };
    }, [results, initialInvestment, monthlyInvestment]);
}

export default useSimulateDCA;