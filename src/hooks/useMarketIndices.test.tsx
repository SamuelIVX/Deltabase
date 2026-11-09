/**
 * Unit tests for useMarketIndices custom hook.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useMarketIndices from "./useMarketIndices";
import type { ReactNode } from "react";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
}

describe("useMarketIndices", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("fetches and returns market indices successfully", async () => {
    const mockData = [
      {
        symbol: "^GSPC",
        name: "S&P 500",
        price: 5800.0,
        change: 12.0,
        changePercent: 0.21,
        currency: "USD",
      },
    ];

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useMarketIndices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.indices).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("handles fetch errors and returns empty indices with error message", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
    });

    const { result } = renderHook(() => useMarketIndices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.indices).toEqual([]);
    expect(result.current.error).toContain("Internal Server Error");
  });
});
