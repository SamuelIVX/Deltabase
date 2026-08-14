/**
 * Unit tests for the CoinDesk latest tick API route (`searchCoinLatestTick`).
 * Asserts standard HTTP Authorization Bearer header usage and absence of api_key query params.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "@/pages/api/searchCoinLatestTick";
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

describe("searchCoinLatestTick", () => {
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
        const tickData = { PRICE: 50000, INSTRUMENT: "BTC-USD" };
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ Data: { "BTC-USD": tickData } }),
        } as Response);

        const req = { query: { instrument: "BTC-USD", market: "kraken" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(tickData);

        expect(fetch).toHaveBeenCalledTimes(1);
        const [calledUrl, calledOptions] = vi.mocked(fetch).mock.calls[0];
        expect(calledUrl.toString()).not.toContain("api_key");
        expect(calledOptions?.headers).toEqual({
            "Content-Type": "application/json",
            "Authorization": "Bearer coindesk-secret-key",
        });
    });
});
