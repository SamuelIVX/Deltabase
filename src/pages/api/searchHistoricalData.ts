/**
 * Next.js Pages API: Yahoo monthly historical chart for What-If DCA windows.
 * Proxies `yahoo-finance2.chart` with a `years`-based lookback (no API key).
 */
import { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "yahoo-finance2";

type YahooChartQuote = {
    date?: Date;
    close?: number;
    volume?: number;
};

type YahooChartResult = {
    quotes?: YahooChartQuote[];
};

/**
 * GET `?symbol=&years=` — monthly quotes from `years` ago through today.
 * @param req - `symbol` (string) and `years` (numeric string) required.
 * @param res - JSON array of monthly quote rows on 200; 400/500 on failure.
 * @example
 * // GET /api/searchHistoricalData?symbol=AAPL&years=5 → 200 [{ date, adjclose, ... }]
 */
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
        const results = await yahooFinance.chart(symbol, queryOptions) as YahooChartResult;

        // Return all monthly data points
        res.status(200).json(results.quotes ?? []);

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
