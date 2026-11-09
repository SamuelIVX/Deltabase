/**
 * Fetches benchmark market indices via `/api/marketIndices` using React Query.
 */
import { useQuery } from "@tanstack/react-query";
import type { MarketIndexItem } from "@/pages/api/marketIndices";

const fetchMarketIndices = async (): Promise<MarketIndexItem[]> => {
  const res = await fetch("/api/marketIndices");
  if (!res.ok) {
    const detail = res.statusText || `HTTP ${res.status}`;
    throw new Error(`Error fetching market indices: ${detail}`);
  }
  return await res.json();
};

/**
 * Returns live/cached index snapshots for S&P 500, NASDAQ, Dow Jones, BTC, ETH.
 * Automatically polls periodically to keep market pulse fresh.
 * @returns Object with `indices` array, `isLoading`, and `error`.
 * @example
 * const { indices, isLoading, error } = useMarketIndices();
 */
export function useMarketIndices() {
  const { data, isLoading, error } = useQuery<MarketIndexItem[]>({
    queryKey: ["marketIndices"],
    queryFn: fetchMarketIndices,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 60 seconds
  });

  return {
    indices: Array.isArray(data) ? data : [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}

export default useMarketIndices;
