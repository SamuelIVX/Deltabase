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
    let lastValidPrice = 0;
    const monthlyPortfolio: DCAResult["monthlyPortfolio"] = [];

    results.forEach((item) => {
        const price = Number(item.adjclose);
        if (!Number.isFinite(price) || price <= 0) return; // skip invalid prices

        // Initial investment at first valid price point
        if (monthlyPortfolio.length === 0 && initialInvestment > 0) {
            totalShares += initialInvestment / price;
            totalInvested += Number(initialInvestment);
        }
        // Monthly investment
        if (monthlyInvestment > 0) {
            totalShares += monthlyInvestment / price;
            totalInvested += Number(monthlyInvestment);
        }
        lastValidPrice = price;
        monthlyPortfolio.push({
            name: item.date.slice(0, 10),
            portfolioValue: (totalShares * price).toFixed(2),
            invested: totalInvested.toFixed(2),
            adjclose: price
        });
    });

    const finalValue = totalShares * lastValidPrice;
    const gain = finalValue - totalInvested;

    return {
        totalShares,
        totalInvested,
        finalValue,
        gain,
        monthlyPortfolio
    };
}
