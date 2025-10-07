import type { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

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
