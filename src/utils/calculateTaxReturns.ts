/**
 * Pure calculation utilities for tax- and fee-adjusted returns on stocks and crypto.
 */

export interface TaxReturnsInput {
    openPrice: number;
    currentPrice: number;
    quantity: number;
    taxRate: number; // percentage (e.g. 15 for 15%)
    feeRate: number; // percentage (e.g. 0.5 for 0.5%)
}

export interface TaxReturnsBreakdown {
    grossProfit: number;
    feeCost: number;
    taxableProfit: number;
    taxAmount: number;
    netProfit: number;
    netReturn: number; // percentage
}

/**
 * Computes tax- and fee-adjusted return breakdown from trade prices and rates.
 * @param input - Trade prices (open, current), quantity, and rates (tax, fee).
 * @returns Complete calculation breakdown, or null if required inputs are non-positive.
 */
export function calculateTaxReturns({
    openPrice,
    currentPrice,
    quantity,
    taxRate,
    feeRate,
}: TaxReturnsInput): TaxReturnsBreakdown | null {
    if (
        !Number.isFinite(openPrice) ||
        !Number.isFinite(currentPrice) ||
        openPrice <= 0 ||
        currentPrice <= 0 ||
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {
        return null;
    }

    const safeTaxRate = Number.isFinite(taxRate) && taxRate > 0 ? taxRate : 0;
    const safeFeeRate = Number.isFinite(feeRate) && feeRate > 0 ? feeRate : 0;

    const grossProfit = (currentPrice - openPrice) * quantity;
    const feeCost = ((openPrice + currentPrice) * quantity * safeFeeRate) / 100;
    const taxableProfit = grossProfit - feeCost;
    const taxAmount = taxableProfit > 0 ? (taxableProfit * safeTaxRate) / 100 : 0;
    const netProfit = taxableProfit - taxAmount;
    const initialInvestment = openPrice * quantity;
    const netReturn = (netProfit / initialInvestment) * 100;

    return {
        grossProfit,
        feeCost,
        taxableProfit,
        taxAmount,
        netProfit,
        netReturn,
    };
}
