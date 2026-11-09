/**
 * Input sanitization and regex validation helpers for Deltabase API endpoints.
 * Guards against parameter pollution, buffer bloat, and unexpected characters.
 */

// Stock symbol pattern: 1-15 characters including uppercase/lowercase letters, digits, and standard Yahoo characters (^, ., -, =)
export const STOCK_SYMBOL_REGEX = /^[A-Za-z0-9^.=-]{1,15}$/;

// Crypto symbol pattern: 1-20 alphanumeric characters, hyphens, and slashes (e.g. BTC-USD, SOL-USD, SOL/USD)
export const CRYPTO_SYMBOL_REGEX = /^[A-Za-z0-9\/-]{1,20}$/;

// Crypto market exchange allowlist pattern (e.g. kraken, coinbase, binance)
export const CRYPTO_MARKET_REGEX = /^[A-Za-z0-9_-]{1,30}$/;

// Search term pattern: 1-40 Unicode letters, digits, spaces, and standard punctuation (e.g. Nestlé, S&P 500)
export const SEARCH_TERM_REGEX = /^[\p{L}\p{N}\s^.,&'-]{1,40}$/u;

/**
 * Validates a stock symbol format (strict, no unvalidated outer whitespace).
 */
export function isValidStockSymbol(symbol: unknown): symbol is string {
    return typeof symbol === 'string' && STOCK_SYMBOL_REGEX.test(symbol);
}

/**
 * Validates a crypto instrument symbol format (strict, no unvalidated outer whitespace).
 */
export function isValidCryptoSymbol(symbol: unknown): symbol is string {
    return typeof symbol === 'string' && CRYPTO_SYMBOL_REGEX.test(symbol);
}

/**
 * Validates a crypto market/exchange parameter format.
 */
export function isValidCryptoMarket(market: unknown): market is string {
    return typeof market === 'string' && CRYPTO_MARKET_REGEX.test(market);
}

/**
 * Validates a generic symbol search query string (non-empty after trimming).
 */
export function isValidSearchTerm(term: unknown): term is string {
    return typeof term === 'string' && term.trim().length > 0 && SEARCH_TERM_REGEX.test(term);
}


