/**
 * Fetches Yahoo range-based chart series via `/api/searchBasicHistoricalData` using React Query.
 * Powers the stock market price chart range toggles.
 */
import { useQuery } from "@tanstack/react-query";

const fetchYahooStockHistoricalData = async (symbol: string, range: string) => {
    const params = new URLSearchParams({ symbol, range });
    const res = await fetch(`/api/searchBasicHistoricalData?${params.toString()}`);
    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data || [];
};

/**
 * Loads formatted historical quotes for `symbol` over `range`.
 * @param symbol - Ticker; empty clears state without fetching.
 * @param range - Lookback key (`1d`…`5y`) passed to the API.
 * @returns `{ historicalData, isLoading, error }` shim for backward compatibility.
 * @example
 * const { historicalData } = useYahooStockHistoricalData("AAPL", "1y");
 */
function useYahooStockHistoricalData(symbol: string, range: string) {
    const enabled = Boolean(symbol);
    const { data, isLoading, error } = useQuery({
        queryKey: ['yahooStockHistoricalData', symbol, range],
        queryFn: () => fetchYahooStockHistoricalData(symbol, range),
        enabled,
        staleTime: 1000 * 60 * 5,
    });

    return {
        historicalData: enabled ? (data ?? []) : [],
        isLoading: enabled ? isLoading : false,
        error: enabled && error ? (error as Error).message : null,
    };
}

export default useYahooStockHistoricalData;
