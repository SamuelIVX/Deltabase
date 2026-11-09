/**
 * Unit tests for the basic historical data API route (`searchBasicHistoricalData`).
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

    it("rejects missing or empty symbol with 400", async () => {
        const req = { method: "GET", query: { range: "1y" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Invalid symbol parameter" });
    });

    it("rejects unsupported range with 400", async () => {
        const req = { method: "GET", query: { symbol: "AAPL", range: "10y" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Invalid range parameter" });
    });

    it("formats quotes array and adds Cache-Control on success", async () => {
        const quoteDate = new Date("2024-01-15T14:30:00.000Z");
        vi.mocked(yahooFinance.chart).mockResolvedValueOnce({
            quotes: [{ date: quoteDate, close: 185.5, volume: 10000 }],
        } as never);

        const req = { method: "GET", query: { symbol: "AAPL", range: "1y" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=120, stale-while-revalidate=300");
        expect(Array.isArray(res.body)).toBe(true);
        expect((res.body as Array<Record<string, unknown>>)[0]).toMatchObject({
            date: "2024-01-15",
            close: 185.5,
            volume: 10000,
        });
    });

    it("returns 500 with sanitized error when chart query fails", async () => {
        vi.mocked(yahooFinance.chart).mockRejectedValueOnce(new Error("Yahoo rate limit"));

        const req = { method: "GET", query: { symbol: "AAPL", range: "1y" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch historical chart data" });
    });
});
