/**
 * Unit tests for useYahooStockQuote hook (kills Stryker mutants).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useYahooStockQuote from "./useYahooStockQuote";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
    function QueryWrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }
    return { QueryWrapper, queryClient };
}

describe("useYahooStockQuote hook", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns null quote and does not fetch when symbol is empty", () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const { QueryWrapper } = createWrapper();
        const { result } = renderHook(() => useYahooStockQuote(""), {
            wrapper: QueryWrapper,
        });

        expect(result.current.quote).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("fetches and returns quote for valid symbol with 2-minute staleTime", async () => {
        const mockQuote = {
            symbol: "AAPL",
            regularMarketPrice: 220.5,
            regularMarketOpen: 218.0,
            currency: "USD",
            shortName: "Apple Inc.",
            regularMarketChangePercent: 1.15,
        };

        const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => mockQuote,
        } as unknown as Response);

        const { QueryWrapper, queryClient } = createWrapper();
        const { result } = renderHook(() => useYahooStockQuote("AAPL"), {
            wrapper: QueryWrapper,
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(fetchSpy).toHaveBeenCalledWith("/api/searchStockQuote?symbol=AAPL");
        expect(result.current.quote).toEqual(mockQuote);
        expect(result.current.error).toBeNull();

        const query = queryClient.getQueryCache().find({ queryKey: ["yahooStockQuote", "AAPL"] });
        expect(query).toBeDefined();
        expect((query?.options as { staleTime?: number })?.staleTime).toBe(120000);
    });

    it("surfaces producer error message from json error body when res.ok is false", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: async () => ({ error: "Failed to fetch stock quote" }),
        } as unknown as Response);

        const { QueryWrapper } = createWrapper();
        const { result } = renderHook(() => useYahooStockQuote("FAIL"), {
            wrapper: QueryWrapper,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Error fetching quote: Failed to fetch stock quote");
        expect(result.current.quote).toBeNull();
    });

    it("falls back to statusText when json error body is missing", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: "Not Found",
            json: async () => ({}),
        } as unknown as Response);

        const { QueryWrapper } = createWrapper();
        const { result } = renderHook(() => useYahooStockQuote("NOTFOUND"), {
            wrapper: QueryWrapper,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Error fetching quote: Not Found");
        expect(result.current.quote).toBeNull();
    });

    it("falls back to statusText when error field is not a string", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 400,
            statusText: "Bad Request",
            json: async () => ({ error: 12345 }),
        } as unknown as Response);

        const { QueryWrapper } = createWrapper();
        const { result } = renderHook(() => useYahooStockQuote("NUM_ERROR"), {
            wrapper: QueryWrapper,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Error fetching quote: Bad Request");
        expect(result.current.quote).toBeNull();
    });

    it("falls back to statusText when body is null or error is empty string", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 400,
            statusText: "Bad Request",
            json: async () => null,
        } as unknown as Response);

        const { QueryWrapper } = createWrapper();
        const { result } = renderHook(() => useYahooStockQuote("NULL_BODY"), {
            wrapper: QueryWrapper,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Error fetching quote: Bad Request");
        expect(result.current.quote).toBeNull();
    });

    it("falls back to statusText when res.json throws a parse error", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 502,
            statusText: "Bad Gateway",
            json: async () => {
                throw new Error("Invalid JSON");
            },
        } as unknown as Response);

        const { QueryWrapper } = createWrapper();
        const { result } = renderHook(() => useYahooStockQuote("HTML_ERROR"), {
            wrapper: QueryWrapper,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Error fetching quote: Bad Gateway");
        expect(result.current.quote).toBeNull();
    });

    it("falls back to status code when both json error body and statusText are empty", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 503,
            statusText: "",
            json: async () => ({}),
        } as unknown as Response);

        const { QueryWrapper } = createWrapper();
        const { result } = renderHook(() => useYahooStockQuote("EMPTY_STATUSTEXT"), {
            wrapper: QueryWrapper,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Error fetching quote: 503");
        expect(result.current.quote).toBeNull();
    });

    it("handles network error rejections gracefully", async () => {
        vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network connection dropped"));

        const { QueryWrapper } = createWrapper();
        const { result } = renderHook(() => useYahooStockQuote("NET_ERR"), {
            wrapper: QueryWrapper,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Network connection dropped");
        expect(result.current.quote).toBeNull();
    });

    it("returns null quote when query data is undefined", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => null,
        } as unknown as Response);

        const { QueryWrapper } = createWrapper();
        const { result } = renderHook(() => useYahooStockQuote("NULL_DATA"), {
            wrapper: QueryWrapper,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.quote).toBeNull();
        expect(result.current.error).toBeNull();
    });
});
