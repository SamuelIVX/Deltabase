import { useEffect, useState } from "react";

type Result = {
    date: string;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
};

interface Params {
    market: string;
    instrument: string;
    limit?: number;
    aggregate?: number;
}

export default function useCryptoHistoricalData({ market, instrument, limit = 30, aggregate = 1 }: Params) {
    const [results, setResults] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!market || !instrument) return;

        setIsLoading(true);
        setError(null);

        fetch(`/api/searchCoinHistoricalData?market=${market}&instrument=${instrument}&limit=${limit}&aggregate=${aggregate}`)
            .then(async res => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP error ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error("Invalid API response format");
                }
                setResults(data);
            })
            .catch(err => {
                console.error('Hook error:', err);
                setError(err.message);
            })
            .finally(() => setIsLoading(false));
    }, [market, instrument, limit, aggregate]);

    return { results, isLoading, error };
}