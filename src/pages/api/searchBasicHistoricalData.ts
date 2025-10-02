// pages/api/yahoo-chart.ts
import { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "yahoo-finance2";

const validRanges = ['1d', '5d', '1m', '3m', '6m', '1y', '5y'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { symbol, range = "1y" } = req.query;

    if (typeof symbol !== "string") {
        return res.status(400).json({ error: "Invalid symbol parameter" });
    }

    if (!validRanges.includes(range as string)) {
        return res.status(400).json({ error: "Invalid range parameter" });
    }

    // Map ranges to intervals and # of days
    const intervalMap: Record<string, { interval: any, days: number }> = {
        '1d': { interval: '2m', days: 1 },
        '5d': { interval: '5m', days: 5 },
        '1m': { interval: '1d', days: 30 },
        '6m': { interval: '1d', days: 180 },
        '1y': { interval: '1d', days: 365 },
        '5y': { interval: '1wk', days: 365 * 5 },
    };

    const { interval, days } = intervalMap[range as string];

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    try {
        const results = await yahooFinance.chart(symbol, {
            period1: startDate,
            period2: today,
            interval: interval,
        });

        const quotes = results.quotes ?? [];

        const formattedData = quotes.map(quote => ({
            date: quote.date?.toISOString().split('T')[0] ?? '',
            time: quote.date?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) ?? '',
            close: quote.close ?? 0,
            volume: quote.volume ?? 0
        }));

        res.status(200).json(formattedData);

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message || "Failed to fetch data" });
    }
}
