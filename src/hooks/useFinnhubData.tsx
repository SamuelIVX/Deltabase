'use client'; 
import { useQuery } from '@tanstack/react-query';

const finnhub_api_key = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
const url = `https://finnhub.io/api/v1/news?category=general&token=${finnhub_api_key}`;

const fetchFinnhubData = async() => {
    const response = await fetch(url);
    if(!response.ok) { throw new Error("Failed to fetch data.")}

    return await response.json();
}

const useFinnhubData = () => {
    return useQuery({
        queryKey: ['finnhub-news'],
        queryFn: fetchFinnhubData,
        staleTime: 1000 * 60 * 5 // 5 minutes cache
    })
};

export default useFinnhubData;