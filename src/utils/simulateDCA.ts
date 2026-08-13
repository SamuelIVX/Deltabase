/**
 * Pure dollar-cost-averaging simulator used by the What-If feature.
 * No I/O — operates on an already-fetched monthly price series.
 */

/** One monthly price row consumed by {@link simulateDCA}. */
export interface DCAResultItem {
    date: string;
    adjclose: string | number;
}

/** Aggregate DCA totals plus per-month portfolio history for charting. */
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
 *
 * @param results - Chronological price rows (`date` + `adjclose`).
 * @param initialInvestment - Lump sum applied only at the first valid price.
 * @param monthlyInvestment - Amount invested at every valid price point.
 * @returns Totals (`totalShares`, `totalInvested`, `finalValue`, `gain`) and `monthlyPortfolio`.
 * @example
 * const out = simulateDCA(
 *   [{ date: "2020-01-01", adjclose: 100 }, { date: "2020-02-01", adjclose: 110 }],
 *   1000,
 *   100
 * );
 * // out.finalValue reflects shares bought at each price
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
