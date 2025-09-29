import { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "yahoo-finance2";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { symbol, years } = req.query;

    if (typeof symbol !== 'string') {
        return res.status(400).json({ error: "Invalid symbol parameter" });
    }

    if (typeof years !== 'string' || isNaN(Number(years))) {
        return res.status(400).json({ error: "Invalid years parameter" });
    }

    const today = new Date();
    const startDate = new Date(today.getFullYear() - Number(years), today.getMonth(), today.getDate()).toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const queryOptions: {
        period1: string;
        period2: string;
        interval: "1mo" | "1d" | "1wk";
    } = {
        period1: startDate,
        period2: endDate,
        interval: "1mo",
    };

    try {
        const results = await yahooFinance.chart(symbol, queryOptions);

        // Return all monthly data points
        res.status(200).json(results.quotes);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export default handler;