/**
 * Input sanitization and regex validation helpers for Deltabase API endpoints.
 * Guards against parameter pollution, buffer bloat, and unexpected characters.
 */

// Stock symbol pattern: 1-15 uppercase/lowercase letters, digits, and standard Yahoo characters (^, ., -)
export const STOCK_SYMBOL_REGEX = /^[A-Za-z0-9^.-]{1,15}$/;

// Crypto symbol pattern: 1-20 alphanumeric characters and hyphens (e.g. BTC-USD, SOL-USD)
export const CRYPTO_SYMBOL_REGEX = /^[A-Za-z0-9-]{1,20}$/;

// Search term pattern: 1-40 alphanumeric characters, spaces, and punctuation
export const SEARCH_TERM_REGEX = /^[A-Za-z0-9\s^.,&'-]{1,40}$/;

/**
 * Validates a stock symbol format.
 */
export function isValidStockSymbol(symbol: unknown): symbol is string {
    return typeof symbol === 'string' && STOCK_SYMBOL_REGEX.test(symbol.trim());
}

/**
 * Validates a crypto instrument symbol format.
 */
export function isValidCryptoSymbol(symbol: unknown): symbol is string {
    return typeof symbol === 'string' && CRYPTO_SYMBOL_REGEX.test(symbol.trim());
}

/**
 * Validates a generic symbol search query string.
 */
export function isValidSearchTerm(term: unknown): term is string {
    return typeof term === 'string' && SEARCH_TERM_REGEX.test(term.trim());
}
