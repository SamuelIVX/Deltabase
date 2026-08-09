import { useState, useEffect } from 'react';

function useYahooHistoricalData(symbol: string, range: string) {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        if (!symbol) {
            queueMicrotask(() => {
                if (cancelled) return;
                setResults([]);
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
            fetch(`/api/searchHistoricalData?symbol=${symbol}&years=${range}`)
                .then(res => res.json())
                .then(data => {
                    if (cancelled) return;
                    setResults(data || []);
                    setError(null);
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
    }, [symbol, range]);

    return { results, isLoading, error };
}

export default useYahooHistoricalData;
