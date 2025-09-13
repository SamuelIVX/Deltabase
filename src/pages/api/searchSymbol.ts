import type { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { searchTerm } = req.query;
    if (!searchTerm || typeof searchTerm !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid searchTerm parameter.' });
    }
    try {
        const results = await yahooFinance.search(searchTerm);
        res.status(200).json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Unknown error.' });
    }
}

export default handler;
