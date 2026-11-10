/**
 * Next.js Pages API: Real-time crypto spot quote via Yahoo Finance.
 * Replaces CoinDesk to provide keyless, unlimited, reliable quotes.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "@/lib/yahooFinance";
import { normalizeCryptoSymbol } from "@/utils/normalizeCryptoSymbol";
import { isValidCryptoSymbol, isValidCryptoMarket } from "@/lib/validation";

/**
 * GET latest tick for `instrument` on `market`.
 * Emits a TickResult-compatible structure matching CoinDesk output.
 * @param req - Optional `market` (default `kraken`), `instrument` (default `BTC-USD`).
 * @param res - Tick object on 200; 400 on invalid input; 500 on Yahoo Finance failure.
 * @example
 * // GET /api/searchCoinLatestTick?instrument=BTC-USD → 200 { PRICE, ... }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method && req.method !== 'GET') {
        if (typeof res.setHeader === 'function') res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { market, instrument } = req.query;

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

    // Convert to Yahoo format e.g. BTC-USD, ETH-USD
    const normalizedInstrument = normalizeCryptoSymbol(resolvedInstrument);

    try {
        const quote = await yahooFinance.quote(normalizedInstrument);

        if (!quote || typeof quote !== 'object' || quote.regularMarketPrice == null) {
            return res.status(400).json({ error: "No tick data found" });
        }

        const price = quote.regularMarketPrice;
        const previousClose = quote.regularMarketPreviousClose ?? price;
        const change = quote.regularMarketChange ?? (price - previousClose);
        const changePercent = quote.regularMarketChangePercent ?? (previousClose ? (change / previousClose) * 100 : 0);

        const tick = {
            TYPE: "953",
            MARKET: resolvedMarket,
            INSTRUMENT: normalizedInstrument,
            MAPPED_INSTRUMENT: normalizedInstrument,
            BASE: normalizedInstrument.split('-')[0] || normalizedInstrument,
            QUOTE: normalizedInstrument.split('-')[1] || "USD",
            PRICE: price,
            CURRENT_DAY_OPEN: quote.regularMarketOpen ?? previousClose,
            CURRENT_DAY_HIGH: quote.regularMarketDayHigh ?? price,
            CURRENT_DAY_LOW: quote.regularMarketDayLow ?? price,
            CURRENT_DAY_CHANGE: change,
            CURRENT_DAY_CHANGE_PERCENTAGE: changePercent,
            CURRENT_HOUR_CHANGE_PERCENTAGE: 0,
            MOVING_24_HOUR_CHANGE: change,
            MOVING_24_HOUR_CHANGE_PERCENTAGE: changePercent,
            CURRENT_DAY_QUOTE_VOLUME: quote.regularMarketVolume ?? 0,
            BEST_BID: quote.bid ?? price,
            BEST_ASK: quote.ask ?? price,
            CURRENT_YEAR_HIGH: quote.fiftyTwoWeekHigh ?? price,
            CURRENT_YEAR_LOW: quote.fiftyTwoWeekLow ?? price,
            LIFETIME_HIGH: quote.fiftyTwoWeekHigh ?? price,
            PRICE_LAST_UPDATE_TS: Math.floor(
                quote.regularMarketTime instanceof Date
                    ? quote.regularMarketTime.getTime() / 1000
                    : Date.now() / 1000
            ),
        };

        if (typeof res.setHeader === 'function') {
            res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        }

        return res.status(200).json(tick);
    } catch (err: unknown) {
        console.error('Yahoo Finance crypto tick error:', err);
        return res.status(500).json({ error: "Failed to fetch crypto tick" });
    }
}
