export interface YahooQuote {
    regularMarketPrice: number;
    regularMarketChangePercent: number;
    regularMarketTime: string;
    regularMarketOpen: number;
    postMarketPrice?: number;
    postMarketChangePercent?: number;
    currency?: string;
    marketCap: number;
    regularMarketDayRange: {
        low: number;
        high: number;
    };
    fiftyTwoWeekRange: {
        low: number;
        high: number;
    };
    forwardPE: number;
    trailingPE: number;
    priceEpsCurrentYear: number;
    dividendYield: number;
    dividendRate: number;
    dividendDate: string | number | Date;
}
