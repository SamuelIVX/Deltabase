/**
 * Unit tests for useYahooBasicHistoricalData hook (kills Stryker mutants).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useYahooBasicHistoricalData from "./useYahooBasicHistoricalData";
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

describe("useYahooBasicHistoricalData hook", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns empty data and does not fetch when symbol is empty", () => {
        const fetchSpy = vi.spyOn(global, "fetch");
        const { result } = renderHook(() => useYahooBasicHistoricalData("", "1d"), {
            wrapper: createWrapper(),
        });

        expect(result.current.historicalData).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isFetching).toBe(false);
        expect(result.current.error).toBeNull();
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("fetches and returns historical series for valid symbol and range", async () => {
        const mockSeries = [
            { date: "2024-01-01", close: 180, volume: 10000 },
            { date: "2024-01-02", close: 182, volume: 12000 },
        ];

        const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => mockSeries,
        } as Response);

        const { result } = renderHook(() => useYahooBasicHistoricalData("MSFT", "1m"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(fetchSpy).toHaveBeenCalledWith("/api/searchBasicHistoricalData?symbol=MSFT&range=1m");
        expect(result.current.historicalData).toEqual(mockSeries);
        expect(result.current.error).toBeNull();
    });

    it("returns empty array fallback when API response is null or undefined", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => null,
        } as Response);

        const { result } = renderHook(() => useYahooBasicHistoricalData("UNKNOWN", "1d"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.historicalData).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it("handles non-ok HTTP responses and surfaces error message", async () => {
        vi.spyOn(global, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 500,
        } as Response);

        const { result } = renderHook(() => useYahooBasicHistoricalData("FAIL", "5d"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toContain("HTTP error 500");
        expect(result.current.historicalData).toEqual([]);
    });

    it("handles network error rejections gracefully", async () => {
        vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Connection reset"));

        const { result } = renderHook(() => useYahooBasicHistoricalData("FAIL", "1y"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBe("Connection reset");
        expect(result.current.historicalData).toEqual([]);
    });
});
