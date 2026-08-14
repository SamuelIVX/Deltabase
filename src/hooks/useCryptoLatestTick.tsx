/**
 * Fetches the latest CoinDesk spot tick via `/api/searchCoinLatestTick` using React Query.
 * Market is fixed to `kraken` for dashboard crypto metrics.
 */
import { useQuery } from "@tanstack/react-query";
import { TickResult, Params } from "@/types/crypto";

const fetchCryptoLatestTick = async (instrument: string): Promise<TickResult> => {
    const params = new URLSearchParams({ market: 'kraken', instrument });
    const res = await fetch(`/api/searchCoinLatestTick?${params.toString()}`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error ${res.status}`);
    }
    return await res.json();
};

/**
 * Loads the latest tick for `instrument` (Kraken market).
 * @param params - Must include `instrument` (e.g. `BTC-USD`); empty clears state.
 * @returns `{ result, isLoading, error }` shim where `result` is a {@link TickResult}.
 * @example
 * const { result } = useCryptoLatestTick({ market: "kraken", instrument: "BTC-USD" });
 */
export default function useCryptoLatestTick({ instrument }: Params) {
    const enabled = Boolean(instrument);
    const { data, isLoading, error } = useQuery({
        queryKey: ['cryptoLatestTick', instrument],
        queryFn: () => fetchCryptoLatestTick(instrument!),
        enabled,
        staleTime: 1000 * 60 * 2,
    });

    return {
        result: enabled ? (data ?? null) : null,
        isLoading: enabled ? isLoading : false,
        error: enabled && error ? (error as Error).message : null,
    };
}
