import { useState, useEffect } from 'react';

function useYahooStockHistoricalData(symbol: string, range: string) {
    const [historicalData, setHistoricalData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        if (!symbol) {
            queueMicrotask(() => {
                if (cancelled) return;
                setHistoricalData([]);
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
            fetch(`/api/searchBasicHistoricalData?symbol=${symbol}&range=${range}`)
                .then(res => res.json())
                .then(data => {
                    if (cancelled) return;
                    setHistoricalData(data || []);
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

    return { historicalData, isLoading, error };
}

export default useYahooStockHistoricalData;
