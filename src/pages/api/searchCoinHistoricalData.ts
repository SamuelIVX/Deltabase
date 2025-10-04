import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const apiKey = process.env.COINDESK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }

    const { market = 'kraken', instrument = 'BTC-USD', limit = '30', aggregate = '1' } = req.query;
    const baseUrl = 'https://data-api.coindesk.com/spot/v1/historical/days';

    const params = {
        market: market as string,
        instrument: instrument as string,
        limit: limit as string,
        aggregate: aggregate as string,
        fill: "true",
        apply_mapping: "true",
        response_format: "JSON",
    };

    const url = new URL(baseUrl);
    url.search = new URLSearchParams(params).toString();

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('CoinDesk API Error:', response.status, errorText);
            throw new Error(`CoinDesk error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Check if data exists
        if (!data || !data.Data) {
            throw new Error("Invalid API response structure");
        }

        const results = data.Data.map((item: any) => ({
            date: new Date(item.TIMESTAMP * 1000).toISOString().split("T")[0],
            timestamp: item.TIMESTAMP,
            open: item.OPEN,
            high: item.HIGH,
            low: item.LOW,
            close: item.CLOSE,
            volume: item.VOLUME
        }));

        res.status(200).json(results);
    } catch (err: any) {
        console.error('Handler error:', err);
        res.status(500).json({ error: err.message });
    }
}
