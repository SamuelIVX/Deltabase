// hooks/useYahooStockQuote.ts
import { useState, useEffect } from 'react';

function useYahooStockQuote(symbol: string) {
    const [quote, setQuote] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        if (!symbol) {
            queueMicrotask(() => {
                if (cancelled) return;
                setQuote(null);
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

            fetch(`/api/searchStockQuote?symbol=${encodeURIComponent(symbol)}`)
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error(`Error fetching quote: ${res.statusText}`);
                    }
                    const data = await res.json();
                    if (!cancelled) setQuote(data);
                })
                .catch(err => {
                    if (!cancelled) setError(err.message);
                })
                .finally(() => {
                    if (!cancelled) setIsLoading(false);
                });
        });

        return () => {
            cancelled = true;
        };
    }, [symbol]);

    return { quote, isLoading, error };
}

export default useYahooStockQuote;
