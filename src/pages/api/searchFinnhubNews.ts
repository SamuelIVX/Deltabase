/**
 * Next.js Pages API: Finnhub general market news proxy for the dashboard rightbar.
 * SECURITY: reads `FINNHUB_API_KEY` from server env and attaches it as the
 * Finnhub `token` query param — never expose this key to the client or log
 * the outbound request URL (it embeds the token).
 */
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * GET Finnhub `category=general` news articles.
 * SECURITY: uses `FINNHUB_API_KEY`; do not log the full upstream URL or token.
 * @param req - Unused query params; category is fixed to `general`.
 * @param res - News article array on 200; 500 if key missing or Finnhub fails; 502 on bad payload.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }

    const baseUrl = "https://finnhub.io/api/v1/news";

    const params = {
        category: "general",
        token: apiKey,
    };

    const url = new URL(baseUrl);
    url.search = new URLSearchParams(params).toString();

    try {
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Finnhub API Error:", response.status, errorText);
            return res.status(500).json({ error: `Finnhub error: ${response.status}` });
        }

        let data: unknown;
        try {
            data = await response.json();
        } catch {
            return res.status(502).json({ error: "Unexpected response from Finnhub" });
        }

        if (!Array.isArray(data)) {
            return res.status(502).json({ error: "Unexpected response from Finnhub" });
        }

        res.status(200).json(data);
    } catch (err: unknown) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
}
