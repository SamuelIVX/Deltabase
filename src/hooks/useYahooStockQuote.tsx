/**
 * Fetches a Yahoo Finance quote for one ticker via `/api/searchStockQuote` using React Query.
 * Returns `{ quote, isLoading, error }` shim for backward compatibility.
 */
import { useQuery } from "@tanstack/react-query";

const fetchYahooStockQuote = async (symbol: string) => {
    const res = await fetch(`/api/searchStockQuote?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) {
        throw new Error(`Error fetching quote: ${res.statusText}`);
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
function useYahooStockQuote(symbol: string) {
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
