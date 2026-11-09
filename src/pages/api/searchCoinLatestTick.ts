/**
 * Next.js Pages API: CoinDesk latest spot tick for a crypto instrument.
 * SECURITY: reads `COINDESK_API_KEY` from server env and sends it as an
 * `Authorization: Bearer` header to CoinDesk — never expose this key to the client
 * or log the outbound request headers (it embeds the key).
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getCoinDeskHeaders } from "@/lib/coindesk";
import { normalizeCryptoSymbol } from "@/utils/normalizeCryptoSymbol";
import { isValidCryptoSymbol, isValidCryptoMarket } from "@/lib/validation";

/**


 * GET latest tick for `instrument` on `market`.
 * SECURITY: uses `COINDESK_API_KEY`; do not log the key or raw Authorization header.
 * @param req - Optional `market` (default `kraken`), `instrument` (default `BTC-USD`).
 * @param res - Tick object on 200; 400 if instrument missing from payload; 500 on key/API failure.
 * @example
 * // GET /api/searchCoinLatestTick?instrument=BTC-USD → 200 { PRICE, ... }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method && req.method !== 'GET') {
        if (typeof res.setHeader === 'function') res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const apiKey = process.env.COINDESK_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API key not configured" });
    }

    const {
        market = 'kraken',
        instrument = 'BTC-USD'
    } = req.query;

    const rawMarket = typeof market === 'string' ? market : 'kraken';
    if (!isValidCryptoMarket(rawMarket)) {
        return res.status(400).json({ error: "Invalid market parameter" });
    }

    const rawInstrument = typeof instrument === 'string' ? instrument : 'BTC-USD';
    if (!isValidCryptoSymbol(rawInstrument)) {
        return res.status(400).json({ error: "Invalid instrument parameter" });
    }
    const normalizedInstrument = normalizeCryptoSymbol(rawInstrument);

    const baseUrl = 'https://data-api.coindesk.com/spot/v1/latest/tick';

    const params = {
        market: market as string,
        instruments: normalizedInstrument,
        apply_mapping: "true",
        response_format: "JSON",
    };

    const url = new URL(baseUrl);
    url.search = new URLSearchParams(params).toString();

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: getCoinDeskHeaders(apiKey),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('CoinDesk API Error:', response.status, errorText);
            throw new Error(`CoinDesk error: ${response.status}`);
        }

        const data = await response.json();

        // Extract the tick for the requested instrument safely checking own property
        const tick =
            data &&
            data.Data &&
            typeof data.Data === 'object' &&
            (Object.prototype.hasOwnProperty.call(data.Data, normalizedInstrument)
                ? data.Data[normalizedInstrument]
                : Object.prototype.hasOwnProperty.call(data.Data, rawInstrument)
                    ? data.Data[rawInstrument]
                    : undefined);

        if (!tick) {
            return res.status(400).json({ error: "No tick data found" });
        }

        if (typeof res.setHeader === 'function') {
            res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        }

        res.status(200).json(tick);
    } catch (err: unknown) {
        console.error('CoinDesk latest tick error:', err);
        res.status(500).json({ error: "Failed to fetch crypto tick" });
    }
}
