/**
 * Yahoo Finance quote fields consumed by the stock market metrics UI.
 */

/** Subset of yahoo-finance2 quote fields used by stock market views. */
export interface YahooQuote {
    regularMarketPrice: number;
    regularMarketChangePercent?: number;
    regularMarketTime?: string;
    regularMarketOpen?: number;
    regularMarketPreviousClose?: number;
    regularMarketVolume?: number;
    averageDailyVolume3Month?: number;
    postMarketPrice?: number;
    postMarketChangePercent?: number;
    currency?: string;
    marketCap?: number;
    regularMarketDayRange?: {
        low: number;
        high: number;
    };
    fiftyTwoWeekRange?: {
        low: number;
        high: number;
    };
    fiftyTwoWeekLow?: number;
    fiftyTwoWeekHigh?: number;
    quoteType?: string;
    netExpenseRatio?: number;
    beta?: number;
    forwardPE?: number;
    trailingPE?: number;
    priceEpsCurrentYear?: number;
    epsTrailingTwelveMonths?: number;
    dividendYield?: number;
    dividendRate?: number;
    dividendDate?: string | number | Date;
}
