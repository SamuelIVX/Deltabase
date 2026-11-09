/**
 * Next.js Pages API: Yahoo Finance symbol search (no API key).
 * Proxies `yahoo-finance2.search` for typeahead / asset picker UIs.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

/**
 * GET `?searchTerm=` — returns Yahoo search hits for the query string.
 * @param req - Must include a string `searchTerm` query param.
 * @param res - JSON search results on 200; 400 if term missing; 500 on Yahoo errors.
 * @example
 * // GET /api/searchSymbol?searchTerm=apple → 200 { quotes: [...] }
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method && req.method !== 'GET') {
        if (typeof res.setHeader === 'function') res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { searchTerm } = req.query;
    if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid searchTerm parameter.' });
    }
    try {
        const results = await yahooFinance.search(searchTerm);
        if (typeof res.setHeader === 'function') {
            res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        }
        res.status(200).json(results);
    } catch (err: unknown) {
        console.error('Yahoo Finance search error:', err);
        res.status(500).json({ error: "Failed to search symbols" });
    }
}

export default handler;
