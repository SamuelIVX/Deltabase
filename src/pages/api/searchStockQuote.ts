/**
 * Next.js Pages API: Yahoo Finance quote lookup by symbol (no API key).
 * Proxies `yahoo-finance2.quote` so the client never talks to Yahoo directly.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

/**
 * GET `?symbol=` — returns a Yahoo quote payload for the given ticker.
 * @param req - Must include a string `symbol` query param.
 * @param res - JSON quote on 200; 400 if symbol missing; 500 on Yahoo errors.
 * @example
 * // GET /api/searchStockQuote?symbol=AAPL → 200 { symbol, regularMarketPrice, ... }
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { symbol } = req.query;
    if (!symbol || typeof symbol !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid symbol parameter.' });
    }

    try {
        const results = await yahooFinance.quote(symbol);
        res.status(200).json(results);
    } catch (err: unknown) {
        console.error(err);

        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "Failed to fetch data" });
        }
    }
}

export default handler;
