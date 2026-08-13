/**
 * Short en-US date formatter for market and DCA chart labels.
 */

/**
 * Formats a date-like value as `Mon DD, YYYY`. Falsy input becomes `N/A`.
 * @param dateString - Date string, epoch, or Date instance.
 * @returns Locale date string, or `N/A`.
 * @example
 * formatDate("2024-01-15"); // "Jan 15, 2024"
 */
function formatDate(dateString: string | number | Date): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export default formatDate;
