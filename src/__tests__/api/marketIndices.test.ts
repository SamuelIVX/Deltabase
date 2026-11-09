/**
 * Unit tests for /api/marketIndices route.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "@/pages/api/marketIndices";
import yahooFinance from "@/lib/yahooFinance";
import type { NextApiRequest, NextApiResponse } from "next";

vi.mock("@/lib/yahooFinance", () => ({
  default: {
    quote: vi.fn(),
  },
}));

function createMockReqRes(method = "GET") {
  const headers: Record<string, string | string[]> = {};
  const req = {
    method,
    headers: {},
  } as unknown as NextApiRequest;

  let statusCode = 200;
  let jsonBody: unknown = null;

  const res = {
    status: vi.fn((code: number) => {
      statusCode = code;
      return res;
    }),
    json: vi.fn((body: unknown) => {
      jsonBody = body;
      return res;
    }),
    setHeader: vi.fn((key: string, value: string | string[]) => {
      headers[key] = value;
    }),
  } as unknown as NextApiResponse & {
    getStatus: () => number;
    getBody: () => unknown;
    getHeaders: () => Record<string, string | string[]>;
  };

  res.getStatus = () => statusCode;
  res.getBody = () => jsonBody;
  res.getHeaders = () => headers;

  return { req, res };
}

describe("GET /api/marketIndices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-GET methods with 405 and Allow header", async () => {
    const { req, res } = createMockReqRes("POST");
    await handler(req, res);

    expect(res.getStatus()).toBe(405);
    expect(res.getBody()).toEqual({ error: "Method POST Not Allowed" });
    expect(res.getHeaders()["Allow"]).toEqual(["GET"]);
  });

  it("returns formatted index items with Cache-Control on success", async () => {
    const mockQuotes = [
      { symbol: "^GSPC", regularMarketPrice: 5800.5, regularMarketChange: 12.3, regularMarketChangePercent: 0.21, currency: "USD" },
      { symbol: "^IXIC", regularMarketPrice: 18500.2, regularMarketChange: -45.1, regularMarketChangePercent: -0.24, currency: "USD" },
      { symbol: "^DJI", regularMarketPrice: 42000.0, regularMarketChange: 80.0, regularMarketChangePercent: 0.19, currency: "USD" },
      { symbol: "^RUT", regularMarketPrice: 2200.0, regularMarketChange: 10.0, regularMarketChangePercent: 0.45, currency: "USD" },
      { symbol: "BTC-USD", regularMarketPrice: 76000.0, regularMarketChange: 1500.0, regularMarketChangePercent: 2.01, currency: "USD" },
      { symbol: "ETH-USD", regularMarketPrice: 2800.0, regularMarketChange: -30.0, regularMarketChangePercent: -1.06, currency: "USD" },
      { symbol: "SOL-USD", regularMarketPrice: 180.0, regularMarketChange: 5.0, regularMarketChangePercent: 2.85, currency: "USD" },
      { symbol: "VXUS", regularMarketPrice: 65.0, regularMarketChange: 0.3, regularMarketChangePercent: 0.46, currency: "USD" },
      { symbol: "AAPL", regularMarketPrice: 225.0, regularMarketChange: 1.5, regularMarketChangePercent: 0.67, currency: "USD" },
      { symbol: "MSFT", regularMarketPrice: 420.0, regularMarketChange: 3.0, regularMarketChangePercent: 0.72, currency: "USD" },
      { symbol: "NVDA", regularMarketPrice: 130.0, regularMarketChange: -2.0, regularMarketChangePercent: -1.52, currency: "USD" },
      { symbol: "AMZN", regularMarketPrice: 185.0, regularMarketChange: 2.1, regularMarketChangePercent: 1.15, currency: "USD" },
    ];
    vi.mocked(yahooFinance.quote).mockResolvedValueOnce(mockQuotes as never);

    const { req, res } = createMockReqRes("GET");
    await handler(req, res);

    expect(res.getStatus()).toBe(200);
    const body = res.getBody() as Array<{ symbol: string; name: string; price: number; changePercent: number }>;
    expect(body).toHaveLength(12);
    expect(body[0]).toEqual({
      symbol: "^GSPC",
      name: "S&P 500",
      price: 5800.5,
      change: 12.3,
      changePercent: 0.21,
      currency: "USD",
    });
    expect(body[4].name).toBe("Bitcoin");
    expect(body[7].symbol).toBe("VXUS");
    expect(res.getHeaders()["Cache-Control"]).toBe("public, s-maxage=30, stale-while-revalidate=60");
  });

  it("handles missing or partial quote objects gracefully with fallbacks", async () => {
    vi.mocked(yahooFinance.quote).mockResolvedValueOnce([
      { symbol: "^GSPC" }, // missing price/change fields
    ] as never);

    const { req, res } = createMockReqRes("GET");
    await handler(req, res);

    expect(res.getStatus()).toBe(200);
    const body = res.getBody() as Array<{ symbol: string; price: number | null; change: number | null; changePercent: number | null }>;
    expect(body[0]).toEqual({
      symbol: "^GSPC",
      name: "S&P 500",
      price: null,
      change: null,
      changePercent: null,
      currency: "USD",
    });
  });

  it("returns 500 with sanitized error when upstream throws", async () => {
    vi.mocked(yahooFinance.quote).mockRejectedValueOnce(new Error("Yahoo rate limit"));

    const { req, res } = createMockReqRes("GET");
    await handler(req, res);

    expect(res.getStatus()).toBe(500);
    expect(res.getBody()).toEqual({ error: "Failed to fetch market indices" });
  });
});
