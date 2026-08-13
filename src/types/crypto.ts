/**
 * Shared TypeScript shapes for CoinDesk spot tick payloads and hook params.
 */

/** Latest-tick fields returned by the CoinDesk spot API (and related UI). */
export interface TickResult {
    MARKET: string;
    CURRENT_DAY_LOW: number;
    CURRENT_DAY_HIGH: number;
    CURRENT_DAY_OPEN: number;
    CURRENT_DAY_QUOTE_VOLUME: number;
    BEST_BID: number;
    BEST_ASK: number;
    CURRENT_YEAR_HIGH: number;
    CURRENT_YEAR_LOW: number;
    LIFETIME_HIGH: number;
    PRICE: number;
    INSTRUMENT?: string;
    QUOTE?: string;
    PRICE_LAST_UPDATE_TS: number;
    CURRENT_DAY_CHANGE_PERCENTAGE: number;
    CURRENT_HOUR_CHANGE_PERCENTAGE: number;
    MOVING_24_HOUR_CHANGE_PERCENTAGE: number;
    CURRENT_DAY_CHANGE: number;
    [key: string]: unknown;
}

/** Query params for crypto historical / latest-tick hooks and API routes. */
export interface Params {
    market: string;
    instrument: string;
    range?: string;
}
