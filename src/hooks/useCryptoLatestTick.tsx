import { useEffect, useState } from "react";
import { TickResult } from '@/types/crypto';
import { Params } from "@/types/crypto";

export default function useCryptoLatestTick({ instrument }: Params) {
    const [result, setResult] = useState<TickResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!instrument) return;

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
                setResult(data);
            })
            .catch(err => {
                console.error('Hook error:', err);
                setError(err.message);
            })
            .finally(() => setIsLoading(false));
    }, [instrument]);

    return { result, isLoading, error };
}