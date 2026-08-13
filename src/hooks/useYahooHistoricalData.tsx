/**
 * Fetches Yahoo monthly history via `/api/searchHistoricalData` for What-If DCA.
 * The `range` argument is forwarded as the API `years` query param.
 */
import { useState, useEffect } from 'react';

/**
 * Loads monthly Yahoo quotes for `symbol` spanning `range` years.
 * @param symbol - Ticker; empty clears state without fetching.
 * @param range - Year count string passed to the API as `years`.
 * @returns `{ results, isLoading, error }`.
 * @example
 * const { results } = useYahooHistoricalData("AAPL", "5");
 */
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
