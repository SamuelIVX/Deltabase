/**
 * Pure calculation utilities for tax- and fee-adjusted returns on stocks and crypto.
 */
import type { TaxReturnsInput, TaxReturnsBreakdown } from '@/types/tax';

export type { TaxReturnsInput, TaxReturnsBreakdown };

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

    const safeTaxRate = Number.isFinite(taxRate) ? Math.min(100, Math.max(0, taxRate)) : 0;
    const safeFeeRate = Number.isFinite(feeRate) ? Math.min(100, Math.max(0, feeRate)) : 0;

    const initialInvestment = openPrice * quantity;
    const grossProfit = (currentPrice - openPrice) * quantity;
    const feeCost = ((openPrice + currentPrice) * quantity * safeFeeRate) / 100;
    const taxableProfit = grossProfit - feeCost;
    const taxAmount = (Math.max(0, taxableProfit) * safeTaxRate) / 100;
    const netProfit = taxableProfit - taxAmount;
    const netReturn = (netProfit / initialInvestment) * 100;
    const totalExitValue = initialInvestment + netProfit;

    return {
        initialInvestment,
        grossProfit,
        feeCost,
        taxableProfit,
        taxAmount,
        netProfit,
        netReturn,
        totalExitValue,
    };
}
