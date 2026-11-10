/**
 * Next.js Pages API: Real-time crypto spot historical candles via Yahoo Finance.
 * Replaces CoinDesk to provide keyless, unlimited, high-volume candle series.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "@/lib/yahooFinance";
import { normalizeCryptoSymbol } from "@/utils/normalizeCryptoSymbol";
import { isValidCryptoSymbol, isValidCryptoMarket } from "@/lib/validation";

type YahooInterval = "1d" | "5d" | "1m" | "2m" | "5m" | "15m" | "30m" | "60m" | "90m" | "1h" | "1wk" | "1mo" | "3mo";

interface HistoricalQuote {
    date?: Date;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
}

/**
 * GET historical crypto candles filtered to the requested lookback window.
 * Returns normalized array matching `{ date, time, timestamp, open, high, low, close, volume }[]`.
 * @param req - Optional `market` (default `kraken`), `instrument` (default `BTC-USD`),
 *   `range` (`1d|5d|1mo|3mo|6mo|1y|5y`).
 * @param res - Normalized candle rows on 200; 400 on invalid input; 500 on Yahoo errors.
 * @example
 * // GET /api/searchCoinHistoricalData?instrument=ETH-USD&range=1y → 200 [{ timestamp, close, ... }]
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method && req.method !== 'GET') {
        if (typeof res.setHeader === 'function') res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { market, instrument, range = '1d' } = req.query;

    if (market !== undefined && typeof market !== 'string') {
        return res.status(400).json({ error: "Invalid market parameter" });
    }
    const resolvedMarket = market ?? 'kraken';
    if (!isValidCryptoMarket(resolvedMarket)) {
        return res.status(400).json({ error: "Invalid market parameter" });
    }

    if (instrument !== undefined && typeof instrument !== 'string') {
        return res.status(400).json({ error: "Invalid instrument parameter" });
    }
    const resolvedInstrument = instrument ?? 'BTC-USD';
    if (!isValidCryptoSymbol(resolvedInstrument)) {
        return res.status(400).json({ error: "Invalid instrument parameter" });
    }

    const normalizedInstrument = normalizeCryptoSymbol(resolvedInstrument);

    const rangeConfig: Record<string, { interval: YahooInterval; days: number }> = {
        '1d': { interval: '15m', days: 1 },
        '5d': { interval: '60m', days: 5 },
        '1mo': { interval: '1d', days: 30 },
        '3mo': { interval: '1d', days: 90 },
        '6mo': { interval: '1d', days: 180 },
        '1y': { interval: '1d', days: 365 },
        '5y': { interval: '1wk', days: 1825 },
    };

    const selectedRange = rangeConfig[range as string] || rangeConfig['1mo'];
    const now = new Date();
    const period1 = new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);

    try {
        const chartData = await yahooFinance.chart(normalizedInstrument, {
            period1,
            interval: selectedRange.interval,
        });

        const quotes: HistoricalQuote[] = (chartData?.quotes as HistoricalQuote[]) || [];

        const results = quotes
            .filter((item) => item.date != null && item.close != null)
            .map((item) => {
                const dateObj = new Date(item.date!);
                const ts = Math.floor(dateObj.getTime() / 1000);
                return {
                    date: dateObj.toISOString().split("T")[0],
                    time: dateObj.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    timestamp: ts,
                    open: item.open ?? item.close ?? 0,
                    high: item.high ?? item.close ?? 0,
                    low: item.low ?? item.close ?? 0,
                    close: item.close ?? 0,
                    volume: item.volume ?? 0,
                };
            });

        if (typeof res.setHeader === 'function') {
            res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        }

        return res.status(200).json(results);
    } catch (err: unknown) {
        console.error('Yahoo Finance crypto historical error:', err);
        return res.status(500).json({ error: "Failed to fetch crypto historical data" });
    }
}
