/**
 * Decimal-to-percent display helper for change and yield metrics.
 */

/**
 * Converts a decimal ratio to a percent string with two fraction digits.
 * Falsy values become `N/A`.
 * @param value - Ratio where `0.05` means 5%.
 * @returns Percent string (e.g. `5.00%`), or `N/A`.
 * @example
 * formatPercent(0.0525); // "5.25%"
 */
const formatPercent = (value: number) => {
    if (!value) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
};

export default formatPercent;
