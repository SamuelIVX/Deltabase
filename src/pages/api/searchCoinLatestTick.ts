import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const apiKey = process.env.COINDESK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }

    const {
        market = 'kraken',
        instrument = 'BTC-USD'
    } = req.query;

    const baseUrl = 'https://data-api.coindesk.com/spot/v1/latest/tick';

    const params = {
        market: market as string,
        instruments: instrument as string,
        apply_mapping: "true",
        response_format: "JSON",
        api_key: apiKey, // ✅ pass key as query param
    };

    const url = new URL(baseUrl);
    url.search = new URLSearchParams(params).toString();

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('CoinDesk API Error:', response.status, errorText);
            throw new Error(`CoinDesk error: ${response.status}`);
        }

        const data = await response.json();

        // Extract the tick for the requested instrument
        const tick = data.Data[instrument as string];

        if (!tick) {
            return res.status(400).json({ error: "No tick data found" });
        }

        res.status(200).json(tick);
    } catch (err: unknown) {
        console.error(err);

        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Failed to fetch data" });
        }
    }
}
