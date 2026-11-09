/**
 * Unit tests for the market news API route (`searchFinnhubNews`).
 * Tests Finnhub primary with Yahoo Finance fallback and fail-closed error handling.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handler from "@/pages/api/searchFinnhubNews";
import yahooFinance from "@/lib/yahooFinance";
import type { NextApiRequest, NextApiResponse } from "next";

vi.mock("@/lib/yahooFinance", () => ({
    default: {
        search: vi.fn(),
    },
}));

interface MockRes {
    statusCode: number;
    body: unknown;
    headers: Record<string, string | string[]>;
    status(code: number): MockRes;
    json(body: unknown): MockRes;
    setHeader(name: string, value: string | string[]): MockRes;
}

/**
 * Minimal `NextApiResponse`-like stub for route unit tests.
 * @returns Mutable status/body recorder with chainable `status`/`json`.
 */
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

describe("searchFinnhubNews", () => {
    const originalKey = process.env.FINNHUB_API_KEY;

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        if (originalKey === undefined) {
            delete process.env.FINNHUB_API_KEY;
        } else {
            process.env.FINNHUB_API_KEY = originalKey;
        }
    });

    it("rejects non-GET HTTP methods with 405", async () => {
        const req = { method: "POST" } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(405);
        expect(res.headers["Allow"]).toEqual(["GET"]);
        expect(res.body).toEqual({ error: "Method POST Not Allowed" });
    });

    it("falls back to Yahoo Finance when FINNHUB_API_KEY is not configured", async () => {
        delete process.env.FINNHUB_API_KEY;
        vi.mocked(yahooFinance.search).mockResolvedValueOnce({
            news: [
                {
                    uuid: "yf-1",
                    title: "Markets rally on rate cut hopes",
                    publisher: "Bloomberg",
                    link: "https://finance.yahoo.com/news/test",
                    providerPublishTime: new Date("2026-11-09T00:00:00Z"),
                    thumbnail: { resolutions: [{ url: "https://img.test/thumb.jpg" }] },
                },
            ],
        } as never);

        const req = {} as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=300, stale-while-revalidate=600");
        const body = res.body as Array<{ id: string; headline: string; source: string; image: string }>;
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({
            id: "yf-1",
            headline: "Markets rally on rate cut hopes",
            source: "Bloomberg",
            image: "https://img.test/thumb.jpg",
        });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("proxies Finnhub news directly when Finnhub succeeds", async () => {
        process.env.FINNHUB_API_KEY = "test-key";
        const articles = [{ id: 1, headline: "Markets up", source: "Finnhub" }];
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => articles,
        } as Response);

        const req = {} as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=300, stale-while-revalidate=600");
        expect(res.body).toEqual(articles);
        expect(fetch).toHaveBeenCalledWith(
            "https://finnhub.io/api/v1/news?category=general&token=test-key",
            expect.objectContaining({
                method: "GET",
                headers: { "Content-Type": "application/json" },
            })
        );
        expect(yahooFinance.search).not.toHaveBeenCalled();
    });

    it("falls back to Yahoo Finance when Finnhub returns HTTP 429 rate limit", async () => {
        process.env.FINNHUB_API_KEY = "test-key";
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            status: 429,
        } as Response);
        vi.mocked(yahooFinance.search).mockResolvedValueOnce({
            news: [
                {
                    uuid: "yf-fallback",
                    title: "Fallback headline",
                    publisher: "Reuters",
                    link: "https://finance.yahoo.com/news/fallback",
                },
            ],
        } as never);

        const req = {} as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        const body = res.body as Array<{ id: string; headline: string; source: string }>;
        expect(body).toHaveLength(1);
        expect(body[0].headline).toBe("Fallback headline");
        expect(body[0].source).toBe("Reuters");
    });

    it("falls back to Yahoo Finance when Finnhub returns empty array or invalid payload", async () => {
        process.env.FINNHUB_API_KEY = "test-key";
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        } as Response);
        vi.mocked(yahooFinance.search).mockResolvedValueOnce({
            news: [
                {
                    uuid: "yf-fallback-2",
                    title: "Fallback on empty Finnhub",
                    publisher: "CNBC",
                    link: "https://finance.yahoo.com/news/cnbc",
                },
            ],
        } as never);

        const req = {} as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        const body = res.body as Array<{ headline: string }>;
        expect(body[0].headline).toBe("Fallback on empty Finnhub");
    });

    it("falls back to Yahoo Finance when Finnhub fetch throws network error", async () => {
        process.env.FINNHUB_API_KEY = "test-key";
        vi.mocked(fetch).mockRejectedValueOnce(new Error("Network connection dropped"));
        vi.mocked(yahooFinance.search).mockResolvedValueOnce({
            news: [
                {
                    uuid: "yf-net-fallback",
                    title: "Network error fallback",
                    publisher: "WSJ",
                    link: "https://wsj.com",
                },
            ],
        } as never);

        const req = {} as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        const body = res.body as Array<{ headline: string }>;
        expect(body[0].headline).toBe("Network error fallback");
    });

    it("returns 500 when both Finnhub and Yahoo Finance fallback fail", async () => {
        process.env.FINNHUB_API_KEY = "test-key";
        vi.mocked(fetch).mockRejectedValueOnce(new Error("Finnhub down"));
        vi.mocked(yahooFinance.search).mockRejectedValueOnce(new Error("Yahoo search failed"));

        const req = {} as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to fetch market news" });
    });
});
