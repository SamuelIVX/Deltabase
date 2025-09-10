'use client'
import {useState, useEffect} from 'react'

const finnhub_api_key = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

async function fetchFromFinnhub<T>(searchTerm: string): Promise<T>{
    const url = `https://finnhub.io/api/v1/search?q=${searchTerm}&token=${finnhub_api_key}`;
    const response = await fetch(url);
    if(!response.ok) { throw new Error("Failed to fetch data.") }

    const data = await response.json()
    return data;
}

interface ResultFormat{
    description: string,
    displaySymbol: string,
    symbol: string,
    type: string,
}

interface ResponseFormat{
    count: number, 
    result: ResultFormat[],
}

function useFinnhubStockSymbols(searchTerm: string){

    const [results, setResults] = useState<ResultFormat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        if(searchTerm){
            const fetchData = async() => {
                setIsLoading(true);

                try{
                    const response = await fetchFromFinnhub<ResponseFormat>(searchTerm)
                    setResults(response.result)
                } catch(error){
                    setError(error instanceof Error ? error.message : 'An error occured');
                } finally{
                    setIsLoading(false);
                }
            }

            fetchData();
        };
    }, [searchTerm]);

    return {results, isLoading, error};
}

export default useFinnhubStockSymbols;