'use client'; 
import { useQueries } from '@tanstack/react-query';

const finnhub_api_key = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

const fetchFromFinnhub = async(symbol : string) => {
    const url = `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${finnhub_api_key}`;
    const response = await fetch(url);
    if(!response.ok) { throw new Error("Failed to fetch data.") }

    return await response.json();
}


export function useFinnhubStocks(symbols: string[]) {
    const queries = useQueries({
      queries: symbols.map(sym => ({
        queryKey: ['stock', sym],
        queryFn: () => fetchFromFinnhub(sym),
        refetchInterval: 10000
      }))
    })
  
    return queries  // array of { data, isLoading, isError, error } in same order
  }

export default useFinnhubStocks;