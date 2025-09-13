import { useState, useEffect } from 'react';

function useYahooStockSymbols(searchTerm) {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!searchTerm) {
            setResults([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        fetch(`/api/searchSymbol?searchTerm=${encodeURIComponent(searchTerm)}`)
            .then(res => res.json())
            .then(data => {
                setResults(data.quotes || []);
                setError(null);
            })
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [searchTerm]);

    return { results, isLoading, error };
}

export default useYahooStockSymbols;