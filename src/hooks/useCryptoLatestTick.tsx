import { useEffect, useState } from "react";

interface TickResult {
    INSTRUMENT?: string,
    QUOTE?: string,
    PRICE: number,
    PRICE_LAST_UPDATE_TS: number,
    CURRENT_DAY_CHANGE_PERCENTAGE: number,
    CURRENT_HOUR_CHANGE_PERCENTAGE: number,
    MOVING_24_HOUR_CHANGE_PERCENTAGE: number,
    CURRENT_DAY_CHANGE: number,
    CURRENT_DAY_QUOTE_VOLUME: number,
    [key: string]: any;
}

interface Params {
    instruments: string;
}

export default function useCryptoLatestTick({ instruments }: Params) {
    const [result, setResult] = useState<TickResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!instruments) return;

        setIsLoading(true);
        setError(null);

        fetch(`/api/searchCoinLatestTick?market=kraken&instrument=${instruments}`)
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
    }, [instruments]);

    return { result, isLoading, error };
}