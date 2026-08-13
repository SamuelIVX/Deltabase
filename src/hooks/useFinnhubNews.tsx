'use client';
import { useQuery } from '@tanstack/react-query';

const fetchFromFinnhub = async () => {
    const response = await fetch("/api/searchFinnhubNews");
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return await response.json();
}

const useFinnhubNews = () => {
    return useQuery({
        queryKey: ['news'],
        queryFn: fetchFromFinnhub,
        staleTime: 1000 * 60 * 5
    })
};

export default useFinnhubNews;