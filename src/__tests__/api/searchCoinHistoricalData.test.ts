/**
 * Unit tests for the crypto historical data API route (`searchCoinHistoricalData`).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "@/pages/api/searchCoinHistoricalData";
import yahooFinance from "@/lib/yahooFinance";
import type { NextApiRequest, NextApiResponse } from "next";

vi.mock("@/lib/yahooFinance", () => ({
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

describe("searchCoinHistoricalData", () => {
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
        const req = { method: "GET", query: { instrument: "INVALID$$$" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Invalid instrument parameter" });
    });

    it("returns formatted historical candles on success", async () => {
        const mockQuotes = [
            {
                date: new Date("2026-10-01T00:00:00Z"),
                open: 65000,
                high: 66000,
                low: 64500,
                close: 65500,
                volume: 1200000,
            },
            {
                date: new Date("2026-10-02T00:00:00Z"),
                open: 65500,
                high: 67000,
                low: 65200,
                close: 66800,
                volume: 1500000,
            },
        ];

        vi.mocked(yahooFinance.chart).mockResolvedValueOnce({
            quotes: mockQuotes,
        } as never);

        const req = { method: "GET", query: { instrument: "BTC-USD", range: "1mo" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=300, stale-while-revalidate=600");
        const body = res.body as Array<Record<string, unknown>>;
        expect(body).toHaveLength(2);
        expect(body[0].close).toBe(65500);
        expect(body[0].date).toBe("2026-10-01");
    });

    it("returns 500 when yahooFinance.chart fails", async () => {
        vi.mocked(yahooFinance.chart).mockRejectedValueOnce(new Error("Yahoo chart fail"));

        const req = { method: "GET", query: { instrument: "BTC-USD" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch crypto historical data" });
    });
});
