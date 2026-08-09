import { useState, useEffect } from 'react';

function useYahooStockSymbols(searchTerm) {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        if (!searchTerm) {
            queueMicrotask(() => {
                if (cancelled) return;
                setResults([]);
                setError(null);
                setIsLoading(false);
            });
            return () => {
                cancelled = true;
                controller.abort();
            };
        }

        queueMicrotask(() => {
            if (cancelled) return;
            setIsLoading(true);
            fetch(`/api/searchSymbol?searchTerm=${encodeURIComponent(searchTerm)}`, {
                signal: controller.signal,
            })
                .then(res => res.json())
                .then(data => {
                    if (cancelled) return;
                    setResults(data.quotes || []);
                    setError(null);
                })
                .catch(err => {
                    if (err.name === 'AbortError' || cancelled) return;
                    setError(err.message);
                })
                .finally(() => {
                    if (!cancelled) setIsLoading(false);
                });
        });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [searchTerm]);

    return { results, isLoading, error };
}

export default useYahooStockSymbols;
