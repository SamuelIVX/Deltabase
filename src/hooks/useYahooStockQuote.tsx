/**
 * Fetches a Yahoo Finance quote for one ticker via `/api/searchStockQuote` using React Query.
 * Returns `{ quote, isLoading, error }` shim for backward compatibility.
 */
import { useQuery } from "@tanstack/react-query";

/** Quote data structure returned by the stock quote API. */
export interface YahooQuote {
    regularMarketPrice?: number;
    regularMarketOpen?: number;
    symbol?: string;
    currency?: string;
    shortName?: string;
    regularMarketChangePercent?: number;
}

/** Hook state returned by `useYahooStockQuote`. */
export interface YahooStockQuoteState {
    quote: YahooQuote | null;
    isLoading: boolean;
    error: string | null;
}

const fetchYahooStockQuote = async (symbol: string): Promise<YahooQuote> => {
    const res = await fetch(`/api/searchStockQuote?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) {
        let errorMsg = res.statusText;
        try {
            const body = await res.json();
            if (body && typeof body.error === 'string' && body.error) {
                errorMsg = body.error;
            }
        } catch {
            // Keep res.statusText fallback
        }
        throw new Error(`Error fetching quote: ${errorMsg || res.status}`);
    }
    return await res.json();
};

/**
 * Loads live quote data for `symbol` from the internal stock-quote API.
 * @param symbol - Ticker symbol; empty clears state without fetching.
 * @returns Quote payload plus loading/error flags.
 * @example
 * const { quote, isLoading, error } = useYahooStockQuote("AAPL");
 */
function useYahooStockQuote(symbol: string): YahooStockQuoteState {
    const enabled = Boolean(symbol);
    const { data, isLoading, error } = useQuery({
        queryKey: ['yahooStockQuote', symbol],
        queryFn: () => fetchYahooStockQuote(symbol),
        enabled,
        staleTime: 1000 * 60 * 2,
    });

    return {
        quote: enabled ? (data ?? null) : null,
        isLoading: enabled ? isLoading : false,
        error: enabled && error ? (error as Error).message : null,
    };
}

export default useYahooStockQuote;
