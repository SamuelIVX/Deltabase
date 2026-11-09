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
    if (req.method && req.method !== 'GET') {
        if (typeof res.setHeader === 'function') res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { symbol } = req.query;
    if (!symbol || typeof symbol !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid symbol parameter.' });
    }

    try {
        const results = await yahooFinance.quote(symbol);
        if (typeof res.setHeader === 'function') {
            res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        }
        res.status(200).json(results);
    } catch (err: unknown) {
        console.error('Yahoo Finance quote error:', err);
        res.status(500).json({ error: "Failed to fetch stock quote" });
    }
}

export default handler;
