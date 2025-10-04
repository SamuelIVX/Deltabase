import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const apiKey = process.env.COINDESK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }

    const {
        market = 'kraken',
        instrument = 'BTC-USD',
        range = '1d'
    } = req.query;

    // Calculate timestamps based on range
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const rangeMap: { [key: string]: { seconds: number, interval: string } } = {
        '1d': { seconds: 1 * 24 * 60 * 60, interval: 'hours' },
        '5d': { seconds: 5 * 24 * 60 * 60, interval: 'hours' },
        '1mo': { seconds: 30 * 24 * 60 * 60, interval: 'days' },
        '3mo': { seconds: 90 * 24 * 60 * 60, interval: 'days' },
        '6mo': { seconds: 180 * 24 * 60 * 60, interval: 'days' },
        '1y': { seconds: 365 * 24 * 60 * 60, interval: 'days' },
        '5y': { seconds: 5 * 365 * 24 * 60 * 60, interval: 'days' }
    };

    const selectedRange = rangeMap[range as string] || rangeMap['1mo'];
    const fromTs = now - selectedRange.seconds;

    // Determine which endpoint to use based on interval
    const endpointMap: { [key: string]: string } = {
        'hours': 'https://data-api.coindesk.com/spot/v1/historical/hours',
        'days': 'https://data-api.coindesk.com/spot/v1/historical/days'
    };

    const baseUrl = endpointMap[selectedRange.interval];

    const params = {
        market: market as string,
        instrument: instrument as string,
        limit: '2000',
        aggregate: '1',
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

        if (!data || !data.Data) {
            throw new Error("Invalid API response structure");
        }

        // Filter data to only include timestamps within our range
        const filteredData = data.Data.filter((item: any) => item.TIMESTAMP >= fromTs);

        const results = filteredData.map((item: any) => ({
            date: new Date(item.TIMESTAMP * 1000).toISOString().split("T")[0],
            time: new Date(item.TIMESTAMP * 1000).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }),
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