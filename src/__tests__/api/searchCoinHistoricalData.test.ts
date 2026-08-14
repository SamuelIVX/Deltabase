/**
 * Unit tests for the CoinDesk historical candles API route (`searchCoinHistoricalData`).
 * Asserts standard HTTP Authorization Bearer header usage and absence of api_key query params.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "@/pages/api/searchCoinHistoricalData";
import type { NextApiRequest, NextApiResponse } from "next";

interface MockRes {
    statusCode: number;
    body: unknown;
    status(code: number): MockRes;
    json(body: unknown): MockRes;
}

function mockRes(): MockRes {
    const res: MockRes = {
        statusCode: 0,
        body: undefined,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(body: unknown) {
            this.body = body;
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

    it("returns 500 when COINDESK_API_KEY is not configured", async () => {
        delete process.env.COINDESK_API_KEY;
        const req = { query: {} } as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "API key not configured" });
    });

    it("uses Authorization Bearer header and omits api_key query param", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        const candleData = [
            { TIMESTAMP: 1000000, OPEN: 50000, HIGH: 50500, LOW: 49500, CLOSE: 50200, VOLUME: 100 },
        ];
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ Data: candleData }),
        } as Response);

        const req = { query: { instrument: "BTC-USD", market: "kraken", range: "1d" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);

        expect(fetch).toHaveBeenCalledTimes(1);
        const [calledUrl, calledOptions] = vi.mocked(fetch).mock.calls[0];
        expect(calledUrl.toString()).not.toContain("api_key");
        expect(calledOptions?.headers).toEqual({
            "Content-Type": "application/json",
            "Authorization": "Bearer coindesk-secret-key",
        });
    });
});
