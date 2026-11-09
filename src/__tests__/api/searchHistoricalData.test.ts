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
        const invalidInputs = ["-5", "0", "35", "abc", "3.5", "31"];
        for (const input of invalidInputs) {
            const req = { method: "GET", query: { symbol: "AAPL", years: input } } as unknown as NextApiRequest;
            const res = mockRes();
            await handler(req, res as unknown as NextApiResponse);
            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: "Invalid years parameter: must be an integer between 1 and 30" });
        }
    });

    it("accepts boundary years (1 and 30) with 200", async () => {
        vi.mocked(yahooFinance.chart).mockResolvedValue({ quotes: [] } as never);

        for (const boundary of ["1", "30"]) {
            const req = { method: "GET", query: { symbol: "AAPL", years: boundary } } as unknown as NextApiRequest;
            const res = mockRes();
            await handler(req, res as unknown as NextApiResponse);
            expect(res.statusCode).toBe(200);
        }
    });

    it("returns 200 with quote series, exact chart query options, and Cache-Control", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-11-08T12:00:00Z"));

        const mockQuotes = [{ date: new Date("2021-11-08T00:00:00Z"), close: 150 }];
        vi.mocked(yahooFinance.chart).mockResolvedValueOnce({ quotes: mockQuotes } as never);

        const req = { method: "GET", query: { symbol: "AAPL", years: "5" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockQuotes);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=3600, stale-while-revalidate=7200");

        expect(yahooFinance.chart).toHaveBeenCalledTimes(1);
        expect(yahooFinance.chart).toHaveBeenCalledWith("AAPL", {
            period1: "2021-11-08",
            period2: "2026-11-08",
            interval: "1mo",
        });

        vi.useRealTimers();
    });

    it("clamps Feb 29 to Feb 28 when target year is not a leap year", async () => {
        vi.useFakeTimers();
        // Today is Feb 29 on leap year 2024; 1 year ago (2023) is not leap year
        vi.setSystemTime(new Date(2024, 1, 29, 12, 0, 0));

        vi.mocked(yahooFinance.chart).mockResolvedValueOnce({ quotes: [] } as never);

        const req = { method: "GET", query: { symbol: "MSFT", years: "1" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(yahooFinance.chart).toHaveBeenCalledWith("MSFT", {
            period1: "2023-02-28",
            period2: "2024-02-29",
            interval: "1mo",
        });

        vi.useRealTimers();
    });

    it("retains Feb 29 when target year is a leap year", async () => {
        vi.useFakeTimers();
        // Today is Feb 29, 2024; 4 years ago (2020) is also a leap year
        vi.setSystemTime(new Date(2024, 1, 29, 12, 0, 0));

        vi.mocked(yahooFinance.chart).mockResolvedValueOnce({ quotes: [] } as never);

        const req = { method: "GET", query: { symbol: "MSFT", years: "4" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(yahooFinance.chart).toHaveBeenCalledWith("MSFT", {
            period1: "2020-02-29",
            period2: "2024-02-29",
            interval: "1mo",
        });

        vi.useRealTimers();
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
