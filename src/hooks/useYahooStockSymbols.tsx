/**
 * Yahoo symbol search via `/api/searchSymbol` for asset pickers using React Query.
 * Aborts in-flight requests when the search term changes or the hook unmounts.
 */
import { useQuery } from "@tanstack/react-query";
import type { AssetItem } from "@/types/whatif";

const fetchYahooStockSymbols = async (searchTerm: string, signal?: AbortSignal): Promise<AssetItem[]> => {
    const res = await fetch(`/api/searchSymbol?searchTerm=${encodeURIComponent(searchTerm)}`, {
        signal,
    });
    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    return data.quotes || [];
};

/**
 * Searches Yahoo for tickers matching `searchTerm`.
 * @param searchTerm - Free-text query; empty clears results.
 * @returns `{ results, isLoading, error }` Quote hits from Yahoo search.
 * @example
 * const { results } = useYahooStockSymbols("apple");
 */
function useYahooStockSymbols(searchTerm: string) {
    const enabled = Boolean(searchTerm);
    const { data, isLoading, error } = useQuery<AssetItem[]>({
        queryKey: ['yahooStockSymbols', searchTerm],
        queryFn: ({ signal }) => fetchYahooStockSymbols(searchTerm, signal),
        enabled,
        staleTime: 1000 * 60 * 5,
    });

    return {
        results: enabled ? (data ?? []) : [],
        isLoading: enabled ? isLoading : false,
        error: enabled && error ? (error as Error).message : null,
    };
}

export default useYahooStockSymbols;
