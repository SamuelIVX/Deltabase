import { useState, useEffect } from 'react';

function useYahooHistoricalData(symbol: string, range: string) {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!symbol) {
            setResults([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        fetch(`/api/searchHistoricalData?symbol=${symbol}&years=${range}`)
            .then(res => res.json())
            .then(data => {
                setResults(data || []);
                setError(null);
            })
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [symbol, range]);

    return { results, isLoading, error };
}

export default useYahooHistoricalData;