/**
 * Unit tests for the Yahoo search symbols API route (`searchSymbol`).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "@/pages/api/searchSymbol";
import yahooFinance from "yahoo-finance2";
import type { NextApiRequest, NextApiResponse } from "next";

vi.mock("yahoo-finance2", () => ({
    default: {
        search: vi.fn(),
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

describe("searchSymbol API route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects non-GET HTTP methods with 405", async () => {
        const req = { method: "PUT", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(405);
        expect(res.headers["Allow"]).toEqual(["GET"]);
        expect(res.body).toEqual({ error: "Method PUT Not Allowed" });
    });

    it("rejects missing searchTerm with 400", async () => {
        const req = { method: "GET", query: {} } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "Missing or invalid searchTerm parameter." });
    });

    it("returns 200 with search results and Cache-Control on success", async () => {
        const mockResults = { quotes: [{ symbol: "AAPL", shortname: "Apple Inc." }] };
        vi.mocked(yahooFinance.search).mockResolvedValueOnce(mockResults as never);

        const req = { method: "GET", query: { searchTerm: "apple" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(mockResults);
        expect(res.headers["Cache-Control"]).toBe("public, s-maxage=300, stale-while-revalidate=600");
    });

    it("returns 500 with sanitized error when search fails", async () => {
        vi.mocked(yahooFinance.search).mockRejectedValueOnce(new Error("Search upstream failure"));

        const req = { method: "GET", query: { searchTerm: "apple" } } as unknown as NextApiRequest;
        const res = mockRes();
        await handler(req, res as unknown as NextApiResponse);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: "Failed to search symbols" });
    });
});
