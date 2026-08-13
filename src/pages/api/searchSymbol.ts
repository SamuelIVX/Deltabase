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
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { searchTerm } = req.query;
    if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid searchTerm parameter.' });
    }
    try {
        const results = await yahooFinance.search(searchTerm);
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
