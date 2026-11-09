/**
 * Unit tests for useYahooStockSymbols hook (React Query + abort signal).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useYahooStockSymbols from "./useYahooStockSymbols";
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
    return QueryWrapper;
}

describe("useYahooStockSymbols hook", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns empty results and does not fetch when searchTerm is empty", () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const { result } = renderHook(() => useYahooStockSymbols(""), {
            wrapper: createWrapper(),
        });

        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("fetches and returns quotes for a non-empty searchTerm", async () => {
        const mockQuotes = [
            { symbol: "AAPL", shortname: "Apple Inc." },
            { symbol: "AMZN", shortname: "Amazon.com Inc." },
        ];

        const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({ quotes: mockQuotes }),
        } as Response);

        const { result } = renderHook(() => useYahooStockSymbols("apple"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(fetchSpy).toHaveBeenCalledWith(
            "/api/searchSymbol?searchTerm=apple",
            expect.objectContaining({ signal: expect.anything() })
        );
        expect(result.current.results).toEqual(mockQuotes);
        expect(result.current.error).toBeNull();
    });

    it("returns empty array if data.quotes is missing in API response", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        } as Response);

        const { result } = renderHook(() => useYahooStockSymbols("unknown"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.results).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it("handles non-ok HTTP responses and surfaces error message", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 500,
        } as Response);

        const { result } = renderHook(() => useYahooStockSymbols("fail"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("HTTP error 500");
        expect(result.current.results).toEqual([]);
    });

    it("handles network rejections and surfaces error message", async () => {
        vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network offline"));

        const { result } = renderHook(() => useYahooStockSymbols("offline"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Network offline");
        expect(result.current.results).toEqual([]);
    });
});
