/**
 * Next.js Pages API: Top market indices snapshot across 12 major benchmarks
 * (S&P 500, NASDAQ, Dow, Russell 2000, Bitcoin, Ethereum, Solana, Total Intl Stock, and mega-caps).
 * Returns live/cached quote summaries for the global market ribbon.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import yahooFinance from "@/lib/yahooFinance";

export interface MarketIndexItem {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string;
}

const INDEX_CONFIG: Array<{ symbol: string; name: string }> = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "NASDAQ" },
  { symbol: "^DJI", name: "Dow Jones" },
  { symbol: "^RUT", name: "Russell 2000" },
  { symbol: "BTC-USD", name: "Bitcoin" },
  { symbol: "ETH-USD", name: "Ethereum" },
  { symbol: "SOL-USD", name: "Solana" },
  { symbol: "VXUS", name: "Total Intl Stock" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "AMZN", name: "Amazon" },
];

/**
 * GET handler returning current quotes for major market benchmark indices.
 * @param req - Incoming HTTP request.
 * @param res - HTTP response sending `MarketIndexItem[]` or error payload.
 * @example
 * // GET /api/marketIndices → 200 [{ symbol: "^GSPC", name: "S&P 500", price: 5864.67, ... }]
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MarketIndexItem[] | { error: string }>
): Promise<void> {
  if (req.method && req.method !== "GET") {
    if (typeof res.setHeader === "function") res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  try {
    const symbols = INDEX_CONFIG.map((item) => item.symbol);
    const quotes = await yahooFinance.quote(symbols);
    const quoteList = Array.isArray(quotes) ? quotes : [quotes];

    const quoteMap = new Map<string, (typeof quoteList)[number]>();
    for (const q of quoteList) {
      if (q && typeof q.symbol === "string") {
        quoteMap.set(q.symbol.toUpperCase(), q);
      }
    }

    const results: MarketIndexItem[] = INDEX_CONFIG.map(({ symbol, name }) => {
      const q = quoteMap.get(symbol.toUpperCase());
      const hasPrice = typeof q?.regularMarketPrice === "number";
      const hasChange = typeof q?.regularMarketChange === "number";
      const hasChangePct = typeof q?.regularMarketChangePercent === "number";

      return {
        symbol,
        name,
        price: hasPrice ? (q?.regularMarketPrice as number) : null,
        change: hasChange ? (q?.regularMarketChange as number) : null,
        changePercent: hasChangePct ? (q?.regularMarketChangePercent as number) : null,
        currency: typeof q?.currency === "string" ? q.currency : "USD",
      };
    });

    if (typeof res.setHeader === "function") {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=60"
      );
    }

    res.status(200).json(results);
  } catch (err: unknown) {
    console.error("Market indices error:", err);
    res.status(500).json({ error: "Failed to fetch market indices" });
  }
}
