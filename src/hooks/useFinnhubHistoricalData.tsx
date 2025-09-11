'use client'
import { useState, useEffect } from 'react'

const finnhub_api_key = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

async function fetchFinnhubHistoricalData<T>(symbol: string, timePeriod: number):Promise<T>{
  const endDate = new Date();
  const startDate = new Date(endDate.getFullYear() - timePeriod, endDate.getMonth());

  const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=M&from=${startDate.getTime()/1000}&to=${endDate.getTime()/1000}&token=${finnhub_api_key}`;
  const response = await fetch(url);
  if(!response.ok){ throw new Error("Failed to fetch historical data.") }

  const data = await response.json();
  return data
}

interface ResultFormat{
  closingPrices: number[];
  highPrices: number[];
  lowPrices: number[];
  openingPrices: number[];
  status: number[];
  timestamps: number[];
  volume: number[];
}

function useFinnhubHistoricalData(symbol: string, timePeriod: number){
  const [results, setResults] = useState<ResultFormat | null>(null);
    const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if(symbol){
      const fetchHistoricalData = async() =>{
        setIsLoading(true);

        try{
          const response = await fetchFinnhubHistoricalData<ResultFormat>(symbol, timePeriod);
          setResults(response)

        }catch (error){
          setError(error instanceof Error ? error.message : 'An error occured');
        } finally{
          setIsLoading(false);
      }
    }
    fetchHistoricalData()
  }
}, [symbol, timePeriod])

return {results, isLoading, error}
}

export default useFinnhubHistoricalData;