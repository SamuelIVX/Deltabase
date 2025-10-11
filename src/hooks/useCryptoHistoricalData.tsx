import { useEffect, useState } from "react";
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

export default function useCryptoHistoricalData(
    {
        market,
        instrument,
        range = '1mo'
    }: Params) {
    const [results, setResults] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!market || !instrument) return;

        setIsLoading(true);
        setError(null);

        fetch(`/api/searchCoinHistoricalData?market=${market}&instrument=${instrument}&range=${range}`)
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
    }, [market, instrument, range]);

    return { results, isLoading, error };
}