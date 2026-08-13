/**
 * Compact USD currency formatter for dashboard metrics and chart labels.
 */

/**
 * Formats a number as compact USD (e.g. `$1.2M`). Falsy values become `N/A`.
 * @param value - Numeric amount in USD.
 * @returns Locale-formatted compact currency string, or `N/A`.
 * @example
 * formatCurrency(1250000); // "$1.25M"
 */
const formatCurrency = (value: number) => {
    if (!value) return 'N/A';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2
    }).format(value);
};

export default formatCurrency;
