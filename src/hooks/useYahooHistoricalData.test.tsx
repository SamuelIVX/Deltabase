/**
 * Unit tests for useYahooHistoricalData hook (kills Stryker mutants).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useYahooHistoricalData from "./useYahooHistoricalData";
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

describe("useYahooHistoricalData hook", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns empty results and does not fetch when symbol is empty", () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const { result } = renderHook(() => useYahooHistoricalData("", "5"), {
            wrapper: createWrapper(),
        });

        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("fetches and returns historical candles for a valid symbol and range", async () => {
        const mockData = [
            { date: "2023-01-01", adjclose: 150 },
            { date: "2023-02-01", adjclose: 155 },
        ];

        const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => mockData,
        } as Response);

        const { result } = renderHook(() => useYahooHistoricalData("AAPL", "5"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(fetchSpy).toHaveBeenCalledWith("/api/searchHistoricalData?symbol=AAPL&years=5");
        expect(result.current.results).toEqual(mockData);
        expect(result.current.error).toBeNull();
    });

    it("returns empty array fallback when API response is null or undefined", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => null,
        } as Response);

        const { result } = renderHook(() => useYahooHistoricalData("UNKNOWN", "1"), {
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
            status: 404,
        } as Response);

        const { result } = renderHook(() => useYahooHistoricalData("INVALID", "1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toContain("HTTP error 404");
        expect(result.current.results).toEqual([]);
    });

    it("handles network error rejections gracefully", async () => {
        vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network timeout"));

        const { result } = renderHook(() => useYahooHistoricalData("FAIL", "1"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Network timeout");
        expect(result.current.results).toEqual([]);
    });
});
