/**
 * Fetches the latest CoinDesk spot tick via `/api/searchCoinLatestTick`.
 * Market is fixed to `kraken` for dashboard crypto metrics.
 */
import { useEffect, useState } from "react";
import { TickResult } from '@/types/crypto';
import { Params } from "@/types/crypto";

/**
 * Loads the latest tick for `instrument` (Kraken market).
 * @param params - Must include `instrument` (e.g. `BTC-USD`); empty clears state.
 * @returns `{ result, isLoading, error }` where `result` is a {@link TickResult}.
 * @example
 * const { result } = useCryptoLatestTick({ market: "kraken", instrument: "BTC-USD" });
 */
export default function useCryptoLatestTick({ instrument }: Params) {
    const [result, setResult] = useState<TickResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        if (!instrument) {
            queueMicrotask(() => {
                if (cancelled) return;
                setResult(null);
                setError(null);
                setIsLoading(false);
            });
            return () => {
                cancelled = true;
            };
        }

        queueMicrotask(() => {
            if (cancelled) return;
            setIsLoading(true);
            setError(null);

            fetch(`/api/searchCoinLatestTick?market=kraken&instrument=${instrument}`)
                .then(async res => {
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || `HTTP error ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (!cancelled) setResult(data);
                })
                .catch(err => {
                    console.error('Hook error:', err);
                    if (!cancelled) setError(err.message);
                })
                .finally(() => {
                    if (!cancelled) setIsLoading(false);
                });
        });

        return () => {
            cancelled = true;
        };
    }, [instrument]);

    return { result, isLoading, error };
}
