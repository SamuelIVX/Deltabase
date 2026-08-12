import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "@/pages/api/searchFinnhubNews";
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

describe("searchFinnhubNews", () => {
    const originalKey = process.env.FINNHUB_API_KEY;

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalKey === undefined) {
            delete process.env.FINNHUB_API_KEY;
        } else {
            process.env.FINNHUB_API_KEY = originalKey;
        }
    });

    it("returns 500 when the API key is not configured", async () => {
        delete process.env.FINNHUB_API_KEY;
        const req = {} as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "API key not configured" });
    });

    it("proxies Finnhub news and returns the array", async () => {
        process.env.FINNHUB_API_KEY = "test-key";
        const articles = [{ id: 1, headline: "Markets up" }];
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => articles,
        } as Response);

        const req = {} as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(articles);
        expect(fetch).toHaveBeenCalledWith(
            "https://finnhub.io/api/v1/news?category=general&token=test-key",
            expect.anything()
        );
    });

    it("returns 502 on a non-array upstream response", async () => {
        process.env.FINNHUB_API_KEY = "test-key";
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ not: "an array" }),
        } as Response);

        const req = {} as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(502);
    });

    it("returns 500 when the upstream request fails", async () => {
        process.env.FINNHUB_API_KEY = "test-key";
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 429,
            text: async () => "rate limited",
        } as Response);

        const req = {} as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Finnhub error: 429" });
    });
});
