/**
 * Chart data-point shape shared by stock/crypto market series.
 */

/** One OHLCV-ish sample used by market charts (date, close, volume, time). */
export interface SymbolDataPoint {
    date: string;
    close: number;
    volume: number;
    time: string;
}
