/**
 * Next.js Pages API: CoinDesk latest spot tick for a crypto instrument.
 * SECURITY: reads `COINDESK_API_KEY` from server env and passes it as an
 * `api_key` query param to CoinDesk — never expose this key to the client
 * or log the outbound request URL (it embeds the key).
 */
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * GET latest tick for `instrument` on `market`.
 * SECURITY: uses `COINDESK_API_KEY` in the query string; do not log the full URL.
 * @param req - Optional `market` (default `kraken`), `instrument` (default `BTC-USD`).
 * @param res - Tick object on 200; 400 if instrument missing from payload; 500 on key/API failure.
 * @example
 * // GET /api/searchCoinLatestTick?instrument=BTC-USD → 200 { PRICE, ... }
 */
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
