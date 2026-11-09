/**
 * Next.js Pages API: Yahoo monthly historical chart for What-If DCA windows.
 * Proxies `yahoo-finance2.chart` with a `years`-based lookback (no API key).
 */
import { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "@/lib/yahooFinance";

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
    if (req.method && req.method !== 'GET') {
        if (typeof res.setHeader === 'function') res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { symbol, years } = req.query;

    if (typeof symbol !== 'string' || !symbol.trim()) {
        return res.status(400).json({ error: "Invalid symbol parameter" });
    }

    const parsedYears = Number(years);
    if (typeof years !== 'string' || !Number.isInteger(parsedYears) || parsedYears < 1 || parsedYears > 30) {
        return res.status(400).json({ error: "Invalid years parameter: must be an integer between 1 and 30" });
    }

    const today = new Date();
    const targetYear = today.getFullYear() - parsedYears;
    const targetMonth = today.getMonth();
    let targetDate = today.getDate();

    // Clamp Feb 29 to Feb 28 on non-leap years
    if (targetMonth === 1 && targetDate === 29) {
        const isLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;
        if (!isLeap) targetDate = 28;
    }

    const formatYMD = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const startDate = formatYMD(new Date(targetYear, targetMonth, targetDate));
    const endDate = formatYMD(today);

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
        const results = await yahooFinance.chart(symbol.trim(), queryOptions) as YahooChartResult;

        if (typeof res.setHeader === 'function') {
            res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
        }

        // Return all monthly data points
        res.status(200).json(results.quotes ?? []);

    } catch (err: unknown) {
        console.error('Yahoo Finance historical error:', err);
        res.status(500).json({ error: "Failed to fetch historical data" });
    }
}

export default handler;
