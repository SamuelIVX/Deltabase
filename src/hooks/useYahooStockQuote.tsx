// hooks/useYahooStockQuote.ts
import { useState, useEffect } from 'react';

function useYahooStockQuote(symbol: string) {
    const [quote, setQuote] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!symbol) {
            setQuote(null);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        fetch(`/api/searchStockQuote?symbol=${encodeURIComponent(symbol)}`)
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`Error fetching quote: ${res.statusText}`);
                }
                const data = await res.json();
                setQuote(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [symbol]);

    return { quote, isLoading, error };
}

export default useYahooStockQuote;