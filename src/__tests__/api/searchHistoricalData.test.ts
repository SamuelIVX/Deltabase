/**
 * Unit tests for the Yahoo historical DCA API route (`searchHistoricalData`).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "@/pages/api/searchHistoricalData";
import yahooFinance from "yahoo-finance2";
import type { NextApiRequest, NextApiResponse } from "next";

vi.mock("yahoo-finance2", () => ({
    default: {
        chart: vi.fn(),
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

describe("searchHistoricalData API route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects non-GET HTTP methods with 405", async () => {
        const req = { method: "DELETE", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(405);
        expect(res.headers["Allow"]).toEqual(["GET"]);
        expect(res.body).toEqual({ error: "Method DELETE Not Allowed" });
    });

    it("rejects missing or empty symbol with 400", async () => {
        const req = { method: "GET", query: { years: "5" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Invalid symbol parameter" });
    });

    it("rejects invalid years parameter (negative, 0, or > 30) with 400", async () => {
        const invalidInputs = ["-5", "0", "35", "abc", "3.5"];
        for (const input of invalidInputs) {
            const req = { method: "GET", query: { symbol: "AAPL", years: input } } as unknown as NextApiRequest;
            const res = mockRes();
            await handler(req, res as unknown as NextApiResponse);
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: "Invalid years parameter: must be an integer between 1 and 30" });
        }
    });

    it("returns 200 with quote series and Cache-Control on success", async () => {
        const mockQuotes = [{ date: new Date("2020-01-01"), close: 100 }];
        vi.mocked(yahooFinance.chart).mockResolvedValueOnce({ quotes: mockQuotes } as never);

        const req = { method: "GET", query: { symbol: "AAPL", years: "5" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockQuotes);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=3600, stale-while-revalidate=7200");
    });

    it("returns 500 with sanitized error when chart fetch fails", async () => {
        vi.mocked(yahooFinance.chart).mockRejectedValueOnce(new Error("Yahoo upstream error"));

        const req = { method: "GET", query: { symbol: "AAPL", years: "5" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch historical data" });
    });
});
