/**
 * Unit tests for MarketRibbon component.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MarketRibbon from "./MarketRibbon";
import * as useMarketIndicesModule from "@/hooks/useMarketIndices";

vi.mock("@/hooks/useMarketIndices");

describe("MarketRibbon", () => {
  it("renders loading skeletons when data is fetching", () => {
    vi.spyOn(useMarketIndicesModule, "useMarketIndices").mockReturnValue({
      indices: [],
      isLoading: true,
      error: null,
    });

    render(<MarketRibbon />);
    const region = screen.getByRole("region", {
      name: /Market benchmark indices loading/i,
    });
    expect(region).toBeTruthy();
  });

  it("renders live indices when data is available", () => {
    vi.spyOn(useMarketIndicesModule, "useMarketIndices").mockReturnValue({
      indices: [
        {
          symbol: "^GSPC",
          name: "S&P 500",
          price: 5864.67,
          change: 14.2,
          changePercent: 0.24,
          currency: "USD",
        },
        {
          symbol: "BTC-USD",
          name: "Bitcoin",
          price: 76500.0,
          change: -500.0,
          changePercent: -0.65,
          currency: "USD",
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<MarketRibbon />);
    expect(screen.getAllByText("S&P 500")[0]).toBeTruthy();
    expect(screen.getAllByText("$5,864.67")[0]).toBeTruthy();
    expect(screen.getAllByText("+0.24%")[0]).toBeTruthy();

    expect(screen.getAllByText("Bitcoin")[0]).toBeTruthy();
    expect(screen.getAllByText("$76,500.00")[0]).toBeTruthy();
    expect(screen.getAllByText("-0.65%")[0]).toBeTruthy();
  });

  it("renders error state when hook returns an error and indices list is empty", () => {
    vi.spyOn(useMarketIndicesModule, "useMarketIndices").mockReturnValue({
      indices: [],
      isLoading: false,
      error: "Upstream rate limit",
    });

    render(<MarketRibbon />);
    expect(screen.getByText("Market indices temporarily unavailable")).toBeTruthy();
  });

  it("renders nothing when indices list is empty without error", () => {
    vi.spyOn(useMarketIndicesModule, "useMarketIndices").mockReturnValue({
      indices: [],
      isLoading: false,
      error: null,
    });

    const { container } = render(<MarketRibbon />);
    expect(container.firstChild).toBeNull();
  });
});
