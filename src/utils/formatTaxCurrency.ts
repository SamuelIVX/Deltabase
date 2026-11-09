/**
 * Shared currency and rate formatting utilities for tax-adjusted return calculations.
 */

/**
 * Formats a currency amount into standard USD notation with thousands separators and two decimals.
 * Negative amounts place the minus sign before the currency symbol (e.g. `-$1,250.00`).
 *
 * @param val - Dollar amount to format.
 * @returns Standard localized currency string.
 */
export function formatTaxCurrency(val: number): string {
    if (!Number.isFinite(val)) {
        return '$0.00';
    }
    const absVal = Math.abs(val).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const isNegative = Number(val.toFixed(2)) < 0;
    return isNegative ? `-$${absVal}` : `$${absVal}`;
}

/**
 * Formats a tax rate percentage string preserving up to two decimal places without trailing zeroes.
 *
 * @param rate - Percentage rate value.
 * @returns Formatted rate string.
 */
export function formatTaxRate(rate: number): string {
    if (!Number.isFinite(rate)) {
        return '0';
    }
    const rounded = Number(rate.toFixed(2));
    return rounded.toString();
}
