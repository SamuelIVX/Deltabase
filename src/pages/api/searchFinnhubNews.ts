import type { NextApiRequest, NextApiResponse } from "next";

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
            throw new Error(`Finnhub error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            return res.status(502).json({ error: "Unexpected response from Finnhub" });
        }

        res.status(200).json(data);
    } catch (err: unknown) {
        console.error(err);

        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Failed to fetch data" });
        }
    }
}
