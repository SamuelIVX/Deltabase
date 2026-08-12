export interface DCAResultItem {
    date: string;
    adjclose: string | number;
}

export interface DCAResult {
    totalShares: number;
    totalInvested: number;
    finalValue: number;
    gain: number;
    monthlyPortfolio: {
        name: string;
        portfolioValue: string;
        invested: string;
        adjclose: number;
    }[];
}

/**
 * Simulates a dollar-cost-averaging strategy over a series of monthly prices.
 *
 * An optional initial investment is applied at the first price point; a
 * recurring investment is applied at every point. Points with an invalid or
 * zero price are skipped. Returns cumulative totals and the per-month
 * portfolio history used for charting.
 */
export function simulateDCA(
    results: DCAResultItem[],
    initialInvestment: number,
    monthlyInvestment: number
): DCAResult {
    let totalShares = 0;
    let totalInvested = 0;
    const monthlyPortfolio: DCAResult["monthlyPortfolio"] = [];

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
}
