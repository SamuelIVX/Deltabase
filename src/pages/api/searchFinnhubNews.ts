/**
 * Next.js Pages API: Resilient market news endpoint with Finnhub primary and Yahoo Finance fallback.
 * SECURITY: reads `FINNHUB_API_KEY` from server env and attaches it as the
 * Finnhub `token` query param — never expose this key to the client or log
 * the outbound request URL (it embeds the token).
 */
import type { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "@/lib/yahooFinance";
import type { MarketNewsArticle } from "@/types/news";

export type { MarketNewsArticle as MarketNewsItem };

/** Default timeout for outbound Finnhub requests before triggering Yahoo fallback. */
const FINNHUB_TIMEOUT_MS = 5000;

/**
 * Fallback to Yahoo Finance news when Finnhub is unconfigured, rate-limited, or unreachable.
 * @returns Array of normalized market news items.
 */
async function fetchYahooNewsFallback(): Promise<MarketNewsArticle[]> {
    const searchRes = await yahooFinance.search("market", { newsCount: 10 });
    const newsList = Array.isArray(searchRes?.news) ? searchRes.news : [];
    return newsList
        .filter((item): item is NonNullable<typeof item> => Boolean(item && item.title && item.link))
        .map((item, index) => {
            const rawTime = item.providerPublishTime;
            const publishSec = rawTime
                ? Math.floor(new Date(rawTime).getTime() / 1000)
                : Math.floor(Date.now() / 1000);
            const thumbUrl = item.thumbnail?.resolutions?.[0]?.url || "";
            return {
                id: item.uuid || `yf-${index}-${publishSec}`,
                headline: item.title,
                source: item.publisher || "Yahoo Finance",
                url: item.link,
                datetime: Number.isFinite(publishSec) ? publishSec : Math.floor(Date.now() / 1000),
                image: thumbUrl,
                summary: item.title,
            };
        });
}

/**
 * GET market news articles with Finnhub as primary and Yahoo Finance as resilient fallback.
 * @param req - HTTP request (must be GET).
 * @param res - News article array on 200; 500 if both providers fail.
 * @example
 * // GET /api/searchFinnhubNews → 200 [{ id, headline, source, url, datetime, image, summary }]
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method && req.method !== "GET") {
        if (typeof res.setHeader === "function") res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const apiKey = process.env.FINNHUB_API_KEY;

    if (apiKey) {
        const baseUrl = "https://finnhub.io/api/v1/news";
        const url = new URL(baseUrl);
        url.search = new URLSearchParams({
            category: "general",
            token: apiKey,
        }).toString();

        try {
            const response = await fetch(url.toString(), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                signal: AbortSignal.timeout(FINNHUB_TIMEOUT_MS),
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    if (typeof res.setHeader === "function") {
                        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
                    }
                    return res.status(200).json(data);
                }
            } else {
                console.warn(`Finnhub returned ${response.status}; falling back to Yahoo Finance`);
            }
        } catch (finnhubErr: unknown) {
            console.warn("Finnhub fetch error, falling back to Yahoo Finance:", finnhubErr);
        }
    }

    try {
        const fallbackNews = await fetchYahooNewsFallback();
        if (typeof res.setHeader === "function") {
            res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
        }
        return res.status(200).json(fallbackNews);
    } catch (err: unknown) {
        console.error("All news providers failed:", err);
        return res.status(500).json({ error: "Failed to fetch market news" });
    }
}
