/**
 * Unit tests for the CoinDesk latest tick API route (`searchCoinLatestTick`).
 * Asserts standard HTTP Authorization Bearer header usage, prototype pollution guards, and error handling.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "@/pages/api/searchCoinLatestTick";
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

    it("uses Authorization Bearer header, caches, and omits api_key query param", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        const tickData = { PRICE: 50000, INSTRUMENT: "BTC-USD" };
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ Data: { "BTC-USD": tickData } }),
        } as Response);

        const req = { method: "GET", query: { instrument: "BTC-USD", market: "kraken" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(tickData);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=60, stale-while-revalidate=120");

        expect(fetch).toHaveBeenCalledTimes(1);
        const [calledUrl, calledOptions] = vi.mocked(fetch).mock.calls[0];
        expect(calledUrl.toString()).not.toContain("api_key");
        const parsedUrl = new URL(calledUrl.toString());
        expect(parsedUrl.searchParams.get("market")).toBe("kraken");
        expect(parsedUrl.searchParams.get("instruments")).toBe("BTC-USD");
        expect(parsedUrl.searchParams.get("apply_mapping")).toBe("true");
        expect(parsedUrl.searchParams.get("response_format")).toBe("JSON");
        expect(calledOptions?.headers).toEqual({
            "Content-Type": "application/json",
            "Authorization": "Bearer coindesk-secret-key",
        });
    });

    it("uses default parameters when query parameters are omitted", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        const tickData = { PRICE: 65000, INSTRUMENT: "BTC-USD" };
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ Data: { "BTC-USD": tickData } }),
        } as Response);

        const req = { method: "GET", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(tickData);
        const [calledUrl] = vi.mocked(fetch).mock.calls[0];
        const parsedUrl = new URL(calledUrl.toString());
        expect(parsedUrl.searchParams.get("market")).toBe("kraken");
        expect(parsedUrl.searchParams.get("instruments")).toBe("BTC-USD");
    });

    it("rejects inherited prototype properties such as constructor", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ Data: {} }),
        } as Response);

        const req = { method: "GET", query: { instrument: "constructor", market: "kraken" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "No tick data found" });
    });

    it("returns 500 when fetch throws network error", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        vi.mocked(fetch).mockRejectedValue(new Error("Network timeout"));

        const req = { method: "GET", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch crypto tick" });
    });

    it("returns 500 when upstream returns !ok", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 502,
            text: async () => "Bad gateway",
        } as Response);

        const req = { method: "GET", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch crypto tick" });
    });

    it("returns 400 when Data property is missing from response", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ other: 123 }),
        } as Response);

        const req = { method: "GET", query: { instrument: "BTC-USD" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "No tick data found" });
    });

    it("returns 400 when Data property is not an object", async () => {
        process.env.COINDESK_API_KEY = "coindesk-secret-key";
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ Data: "not-an-object" }),
        } as Response);

        const req = { method: "GET", query: { instrument: "BTC-USD" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "No tick data found" });
    });
});
