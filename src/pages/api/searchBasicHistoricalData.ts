import { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "yahoo-finance2";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { symbol, range = "1y" } = req.query;

    if (typeof symbol !== "string") {
        return res.status(400).json({ error: "Invalid symbol parameter" });
    }

    // Map ranges to # of days
    const rangeMap: Record<string, number> = {
        "1d": 1,
        "5d": 5,
        "1mo": 30,
        "3mo": 90,
        "6mo": 180,
        "1y": 365,
        "5y": 365 * 5,
    };

    const days = rangeMap[range as string] ?? 365;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    // Interval logic (avoid unsupported Yahoo combos)
    let chartInterval: "1m" | "5m" | "15m" | "1h" | "1d" | "1wk" | "1mo";
    if (days <= 5) chartInterval = "15m";
    else if (days <= 30) chartInterval = "1h";
    else if (days <= 365) chartInterval = "1d";
    else chartInterval = "1wk";

    const queryOptions = {
        period1: startDate,
        period2: today,
        interval: chartInterval,
    };

    try {
        const results = await yahooFinance.chart(symbol, queryOptions);

        const formattedData = (results.quotes || []).map((quote) => ({
            date: quote.date?.toISOString().split("T")[0],
            time: quote.date?.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            close: quote.close,
            volume: quote.volume,
        }));

        return res.status(200).json(formattedData);
    } catch (error: any) {
        console.error("Yahoo Finance Error:", error);
        return res.status(500).json({ error: error.message || "Failed to fetch data" });
    }
}
