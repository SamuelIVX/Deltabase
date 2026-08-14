/**
 * Fetches CoinDesk historical candles via `/api/searchCoinHistoricalData` using React Query.
 * Used by crypto market charts and What-If crypto legs.
 */
import { useQuery } from "@tanstack/react-query";
import { Params } from "@/types/crypto";

type Result = {
    date: string;
    time: string;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

const fetchCryptoHistoricalData = async (
    market: string,
    instrument: string,
    range: string
): Promise<Result[]> => {
    const res = await fetch(
        `/api/searchCoinHistoricalData?market=${market}&instrument=${instrument}&range=${range}`
    );
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
        throw new Error("Invalid API response format");
    }
    return data;
};

/**
 * Loads historical crypto candles for `market`/`instrument`/`range`.
 * @param params - CoinDesk query params (`market`, `instrument`, optional `range`, default `1mo`).
 * @returns `{ results, isLoading, error }` shim for backward compatibility.
 * @example
 * const { results } = useCryptoHistoricalData({ market: "kraken", instrument: "BTC-USD", range: "1y" });
 */
export default function useCryptoHistoricalData({
    market,
    instrument,
    range = '1mo'
}: Params) {
    const enabled = Boolean(market && instrument);
    const { data, isLoading, error } = useQuery({
        queryKey: ['cryptoHistoricalData', market, instrument, range],
        queryFn: () => fetchCryptoHistoricalData(market!, instrument!, range),
        enabled,
        staleTime: 1000 * 60 * 5,
    });

    return {
        results: enabled ? (data ?? []) : [],
        isLoading: enabled ? isLoading : false,
        error: enabled && error ? (error as Error).message : null,
    };
}
