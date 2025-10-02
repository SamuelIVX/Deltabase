import { useState, useEffect } from 'react';

function useYahooStockHistoricalData(symbol: string, range: string) {
    const [historicalData, setHistoricalData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!symbol) {
            setHistoricalData([]);
            setError(null);
            return;
        }

        setIsLoading(true);
        fetch(`/api/searchBasicHistoricalData?symbol=${symbol}&range=${range}`)
            .then(res => res.json())
            .then(data => {
                setHistoricalData(data || []);
                setError(null);
            })
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [symbol, range]);

    return { historicalData, isLoading, error };
}

export default useYahooStockHistoricalData;