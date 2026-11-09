/**
 * Unit tests for the Yahoo quote API route (`searchStockQuote`).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "@/pages/api/searchStockQuote";
import yahooFinance from "yahoo-finance2";
import type { NextApiRequest, NextApiResponse } from "next";

vi.mock("yahoo-finance2", () => ({
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

describe("searchStockQuote API route", () => {
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

    it("returns 400 when symbol query param is missing", async () => {
        const req = { method: "GET", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Missing or invalid symbol parameter." });
    });

    it("returns 200 and quote data on success with Cache-Control", async () => {
        const mockQuote = { symbol: "AAPL", regularMarketPrice: 200 };
        vi.mocked(yahooFinance.quote).mockResolvedValueOnce(mockQuote as never);

        const req = { method: "GET", query: { symbol: "AAPL" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockQuote);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=60, stale-while-revalidate=120");
    });

    it("returns 500 with sanitized error when yahooFinance.quote throws", async () => {
        vi.mocked(yahooFinance.quote).mockRejectedValueOnce(new Error("upstream rate limit or network fail"));

        const req = { method: "GET", query: { symbol: "FAIL" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch stock quote" });
    });
});
