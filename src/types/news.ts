/**
 * Common data contract for market intelligence news articles.
 * Shared between the server-side news proxy and frontend dashboard feeds.
 */
export interface MarketNewsArticle {
    id: string | number;
    headline: string;
    source: string;
    url: string;
    datetime: number;
    image?: string;
    summary?: string;
}
