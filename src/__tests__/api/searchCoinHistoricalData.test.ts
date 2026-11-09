/**
 * Unit tests for the CoinDesk historical candles API route (`searchCoinHistoricalData`).
 * Asserts standard HTTP Authorization Bearer header usage, HTTP method gating, query handling, and filtering.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "@/pages/api/searchCoinHistoricalData";
import type { NextApiRequest, NextApiResponse } from "next";

interface MockRes {
    statusCode: number;
    body: unknown;
    headers: Record<string, string | string[]>;
    status(code: number): MockRes;
    json(body: unknown): MockRes;
    setHeader(name: string, value: string | string[]): MockRes;
}

function mockRes(): MockRes {
    const res: MockRes = {
        statusCode: 0,
        body: undefined,
        headers: {},
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
    const originalKey = process.env.COINDESK_API_KEY;

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalKey === undefined) {
            delete process.env.COINDESK_API_KEY;
        } else {
            process.env.COINDESK_API_KEY = originalKey;
        }
    });

    it("rejects non-GET HTTP methods with 405", async () => {
        const req = { method: "POST", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(405);
        expect(res.headers["Allow"]).toEqual(["GET"]);
        expect(res.body).toEqual({ error: "Method POST Not Allowed" });
    });

    it("returns 500 when COINDESK_API_KEY is not configured", async () => {
        delete process.env.COINDESK_API_KEY;
        const req = { method: "GET", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "API key not configured" });
    });

    it("uses Authorization Bearer header and returns filtered candles", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        const nowSec = Math.floor(Date.now() / 1000);
        const candleData = [
            { TIMESTAMP: nowSec - 1000, OPEN: 50000, HIGH: 50500, LOW: 49500, CLOSE: 50200, VOLUME: 100 },
            { TIMESTAMP: nowSec - 100000, OPEN: 48000, HIGH: 49000, LOW: 47500, CLOSE: 48500, VOLUME: 50 }, // older than 1d
        ];
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ Data: candleData }),
        } as Response);

        const req = { method: "GET", query: { instrument: "BTC-USD", market: "kraken", range: "1d" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=300, stale-while-revalidate=600");
        const results = res.body as Array<{ timestamp: number; close: number; open: number; high: number; low: number; volume: number; date: string; time: string }>;
        expect(results.length).toBe(1);
        expect(results[0].timestamp).toBe(nowSec - 1000);
        expect(results[0].open).toBe(50000);
        expect(results[0].high).toBe(50500);
        expect(results[0].low).toBe(49500);
        expect(results[0].close).toBe(50200);
        expect(results[0].volume).toBe(100);

        expect(fetch).toHaveBeenCalledTimes(1);
        const [calledUrl, calledOptions] = vi.mocked(fetch).mock.calls[0];
        expect(calledUrl.toString()).toContain("https://data-api.coindesk.com/spot/v1/historical/hours");
        expect(calledUrl.toString()).not.toContain("api_key");
        expect(calledOptions?.headers).toEqual({
            "Content-Type": "application/json",
            "Authorization": "Bearer coindesk-secret-key",
        });
    });

    it("uses default parameters and days endpoint for 1mo range", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        const nowSec = Math.floor(Date.now() / 1000);
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ Data: [{ TIMESTAMP: nowSec, OPEN: 1, HIGH: 2, LOW: 1, CLOSE: 2, VOLUME: 10 }] }),
        } as Response);

        const req = { method: "GET", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        const [calledUrl] = vi.mocked(fetch).mock.calls[0];
        expect(calledUrl.toString()).toContain("https://data-api.coindesk.com/spot/v1/historical/hours");
        expect(calledUrl.toString()).toContain("instrument=BTC-USD");
        expect(calledUrl.toString()).toContain("market=kraken");
    });

    it("handles 1y range routing to days endpoint", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        const nowSec = Math.floor(Date.now() / 1000);
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ Data: [{ TIMESTAMP: nowSec, OPEN: 10, HIGH: 20, LOW: 10, CLOSE: 20, VOLUME: 5 }] }),
        } as Response);

        const req = { method: "GET", query: { range: "1y" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        const [calledUrl] = vi.mocked(fetch).mock.calls[0];
        expect(calledUrl.toString()).toContain("https://data-api.coindesk.com/spot/v1/historical/days");
    });

    it("returns 500 when fetch throws an error", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        vi.mocked(fetch).mockRejectedValue(new Error("Network failed"));

        const req = { method: "GET", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch crypto historical data" });
    });

    it("returns 500 when upstream responds with !ok", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 403,
            text: async () => "Forbidden",
        } as Response);

        const req = { method: "GET", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch crypto historical data" });
    });

    it("returns 500 when response json has invalid structure", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ SomethingElse: [] }),
        } as Response);

        const req = { method: "GET", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch crypto historical data" });
    });
});
