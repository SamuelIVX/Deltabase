/**
 * React Query hook for Finnhub general news via the server proxy `/api/searchFinnhubNews`.
 * Keeps the Finnhub API key off the client (see PR #221).
 */
'use client';
import { useQuery } from '@tanstack/react-query';

/**
 * Fetches news JSON from the internal Finnhub proxy route.
 * @returns Parsed news article array from `/api/searchFinnhubNews`.
 * @throws {Error} When the proxy responds non-OK (uses JSON `error` when present).
 */
const fetchFromFinnhub = async () => {
    const response = await fetch("/api/searchFinnhubNews");
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return await response.json();
}

/**
 * Loads Finnhub general news with a 5-minute stale time.
 * @returns React Query result for the `['news']` query key.
 * @example
 * const { data, isLoading, error } = useFinnhubNews();
 */
const useFinnhubNews = () => {
    return useQuery({
        queryKey: ['news'],
        queryFn: fetchFromFinnhub,
        staleTime: 1000 * 60 * 5
    })
};

export default useFinnhubNews;
