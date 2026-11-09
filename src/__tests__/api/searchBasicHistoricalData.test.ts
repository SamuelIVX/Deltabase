/**
 * Unit tests for the basic historical chart API route (`searchBasicHistoricalData`).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "@/pages/api/searchBasicHistoricalData";
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

describe("searchBasicHistoricalData API route", () => {
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

    it("rejects invalid or empty symbols with 400", async () => {
        const invalidSymbols = [undefined, "", "   "];
        for (const sym of invalidSymbols) {
            const req = { method: "GET", query: { symbol: sym } } as unknown as NextApiRequest;
            const res = mockRes();
            await handler(req, res as unknown as NextApiResponse);
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: "Invalid symbol parameter" });
        }
    });

    it("rejects invalid range values with 400", async () => {
        const req = { method: "GET", query: { symbol: "AAPL", range: "2y" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Invalid range parameter" });
    });

    it("maps all valid range values to the expected interval and days", async () => {
        vi.mocked(yahooFinance.chart).mockResolvedValue({ quotes: [] } as never);

        const rangeExpectations = [
            { range: "1d", interval: "2m" },
            { range: "5d", interval: "5m" },
            { range: "1m", interval: "1d" },
            { range: "3m", interval: "1d" },
            { range: "6m", interval: "1d" },
            { range: "1y", interval: "1d" },
            { range: "5y", interval: "1wk" },
        ];

        for (const { range, interval } of rangeExpectations) {
            vi.clearAllMocks();
            const req = { method: "GET", query: { symbol: "AAPL", range } } as unknown as NextApiRequest;
            const res = mockRes();
            await handler(req, res as unknown as NextApiResponse);

            expect(res.statusCode).toBe(200);
            expect(yahooFinance.chart).toHaveBeenCalledWith(
                "AAPL",
                expect.objectContaining({ interval })
            );
        }
    });

    it("formats quotes array, provides fallbacks for missing fields, and adds Cache-Control", async () => {
        const mockQuotes = [
            {
                date: new Date("2024-01-15T14:30:00Z"),
                close: 185.5,
                volume: 5000000,
            },
            {
                date: undefined,
                close: undefined,
                volume: undefined,
            },
        ];
        vi.mocked(yahooFinance.chart).mockResolvedValueOnce({ quotes: mockQuotes } as never);

        const req = { method: "GET", query: { symbol: "AAPL", range: "1m" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=120, stale-while-revalidate=300");

        const data = res.body as Array<{ date: string; time: string; close: number; volume: number }>;
        expect(data).toHaveLength(2);
        expect(data[0].close).toBe(185.5);
        expect(data[0].volume).toBe(5000000);
        expect(data[0].date).toBe("2024-01-15");
        expect(data[0].time).toBeTruthy();

        // Fallbacks for undefined fields
        expect(data[1].close).toBe(0);
        expect(data[1].volume).toBe(0);
        expect(data[1].date).toBe("");
        expect(data[1].time).toBe("");
    });

    it("handles response with undefined quotes property", async () => {
        vi.mocked(yahooFinance.chart).mockResolvedValueOnce({} as never);

        const req = { method: "GET", query: { symbol: "AAPL" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("returns 500 with sanitized error when chart query fails", async () => {
        vi.mocked(yahooFinance.chart).mockRejectedValueOnce(new Error("Yahoo rate limit"));

        const req = { method: "GET", query: { symbol: "AAPL", range: "1m" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch historical chart data" });
    });
});
