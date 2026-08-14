/**
 * Fetches Yahoo monthly history via `/api/searchHistoricalData` for What-If DCA using React Query.
 * The `range` argument is forwarded as the API `years` query param.
 */
import { useQuery } from "@tanstack/react-query";

const fetchYahooHistoricalData = async (symbol: string, range: string) => {
    const res = await fetch(`/api/searchHistoricalData?symbol=${symbol}&years=${range}`);
    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data || [];
};

/**
 * Loads monthly Yahoo quotes for `symbol` spanning `range` years.
 * @param symbol - Ticker; empty clears state without fetching.
 * @param range - Year count string passed to the API as `years`.
 * @returns `{ results, isLoading, error }` shim for backward compatibility.
 * @example
 * const { results } = useYahooHistoricalData("AAPL", "5");
 */
function useYahooHistoricalData(symbol: string, range: string) {
    const enabled = Boolean(symbol);
    const { data, isLoading, error } = useQuery({
        queryKey: ['yahooHistoricalData', symbol, range],
        queryFn: () => fetchYahooHistoricalData(symbol, range),
        enabled,
        staleTime: 1000 * 60 * 5,
    });

    return {
        results: enabled ? (data ?? []) : [],
        isLoading: enabled ? isLoading : false,
        error: enabled && error ? (error as Error).message : null,
    };
}

export default useYahooHistoricalData;
