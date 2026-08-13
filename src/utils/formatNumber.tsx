/**
 * Compact number formatter for volumes and large market stats.
 */

/**
 * Formats a number with compact notation (e.g. `1.25M`). Falsy values become `N/A`.
 * @param value - Numeric value to display.
 * @returns Locale-formatted compact number string, or `N/A`.
 * @example
 * formatNumber(1500000); // "1.5M"
 */
const formatNumber = (value: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2
    }).format(value);
};

export default formatNumber;
