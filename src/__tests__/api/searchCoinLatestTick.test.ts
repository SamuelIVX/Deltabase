/**
 * Unit tests for the crypto latest tick API route (`searchCoinLatestTick`).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "@/pages/api/searchCoinLatestTick";
import yahooFinance from "@/lib/yahooFinance";
import type { NextApiRequest, NextApiResponse } from "next";

vi.mock("@/lib/yahooFinance", () => ({
    default: {
        quote: vi.fn(),
    },
}));

interface MockRes {
    statusCode: number;
    headers: Record<string, string | string[]>;
    body: unknown;
    status(code: number): MockRes;
    json(body: unknown): MockRes;
    setHeader(name: string, value: string | string[]): MockRes;
}

function mockRes(): MockRes {
    const res: MockRes = {
        statusCode: 0,
        headers: {},
        body: undefined,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(body: unknown) {
            this.body = body;
            return this;
        },
        setHeader(name: string, value: string | string[]) {
            this.headers[name] = value;
            return this;
        },
    };
    return res;
}

describe("searchCoinLatestTick", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects non-GET HTTP methods with 405", async () => {
        const req = { method: "POST", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(405);
        expect(res.headers["Allow"]).toEqual(["GET"]);
        expect(res.body).toEqual({ error: "Method POST Not Allowed" });
    });

    it("rejects invalid instrument with 400", async () => {
        const req = { method: "GET", query: { instrument: "INVALID$?%" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Invalid instrument parameter" });
    });

    it("returns 200 with formatted tick payload on successful quote", async () => {
        vi.mocked(yahooFinance.quote).mockResolvedValueOnce({
            regularMarketPrice: 75128.5,
            regularMarketOpen: 74000.0,
            regularMarketDayHigh: 76000.0,
            regularMarketDayLow: 73500.0,
            regularMarketChange: 1128.5,
            regularMarketChangePercent: 1.52,
            regularMarketVolume: 25000000000,
            regularMarketTime: new Date(1794273000 * 1000),
            fiftyTwoWeekHigh: 80000.0,
            fiftyTwoWeekLow: 40000.0,
            bid: 75125.0,
            ask: 75130.0,
        } as never);

        const req = { method: "GET", query: { instrument: "BTC-USD" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=60, stale-while-revalidate=120");
        const body = res.body as Record<string, unknown>;
        expect(body.PRICE).toBe(75128.5);
        expect(body.INSTRUMENT).toBe("BTC-USD");
        expect(body.CURRENT_DAY_HIGH).toBe(76000.0);
    });

    it("returns 500 when yahooFinance.quote throws an error", async () => {
        vi.mocked(yahooFinance.quote).mockRejectedValueOnce(new Error("Yahoo rate limit or network fail"));

        const req = { method: "GET", query: { instrument: "BTC-USD" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch crypto tick" });
    });
});
