/**
 * Unit tests for MacroCards component.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MacroCards from "./MacroCards";
import useMarketIndices from "@/hooks/useMarketIndices";

vi.mock("@/hooks/useMarketIndices");

describe("MacroCards component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton cards when loading and no indices are cached", () => {
    vi.mocked(useMarketIndices).mockReturnValue({
      indices: [],
      isLoading: true,
      error: null,
    });

    const { container } = render(<MacroCards />);
    const region = screen.getByRole("region", { name: "Macro market indicators" });
    expect(region).toBeInTheDocument();
    expect(container.querySelectorAll('div[class*="skeletonCard"]')).toHaveLength(4);
  });

  it("renders live macro benchmark cards with prices and changes", () => {
    vi.mocked(useMarketIndices).mockReturnValue({
      indices: [
        {
          symbol: "^GSPC",
          name: "S&P 500",
          price: 5864.67,
          change: 24.3,
          changePercent: 0.42,
          currency: "USD",
        },
        {
          symbol: "^IXIC",
          name: "NASDAQ",
          price: 18518.61,
          change: -45.12,
          changePercent: -0.24,
          currency: "USD",
        },
        {
          symbol: "^DJI",
          name: "Dow Jones",
          price: 42114.4,
          change: 110.5,
          changePercent: 0.26,
          currency: "USD",
        },
        {
          symbol: "BTC-USD",
          name: "Bitcoin",
          price: 76500.0,
          change: 1250.0,
          changePercent: 1.66,
          currency: "USD",
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<MacroCards />);

    expect(screen.getByText("S&P 500")).toBeInTheDocument();
    expect(screen.getByText("^GSPC")).toBeInTheDocument();
    expect(screen.getByText("$5,864.67")).toBeInTheDocument();
    expect(screen.getByText("+24.30 (+0.42%)")).toBeInTheDocument();

    expect(screen.getByText("NASDAQ")).toBeInTheDocument();
    expect(screen.getByText("-45.12 (-0.24%)")).toBeInTheDocument();

    expect(screen.getByText("Dow Jones")).toBeInTheDocument();
    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
  });

  it("handles null prices and null changes gracefully", () => {
    vi.mocked(useMarketIndices).mockReturnValue({
      indices: [
        {
          symbol: "^GSPC",
          name: "S&P 500",
          price: null,
          change: null,
          changePercent: null,
          currency: "USD",
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<MacroCards />);

    expect(screen.getByText("S&P 500")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.getByText("N/A (N/A)")).toBeInTheDocument();
  });

  it("formats zero price as $0.00 and respects item.currency", () => {
    vi.mocked(useMarketIndices).mockReturnValue({
      indices: [
        {
          symbol: "ZERO",
          name: "Zero Asset",
          price: 0,
          change: 0,
          changePercent: 0,
          currency: "USD",
        },
        {
          symbol: "EURINDEX",
          name: "Euro Index",
          price: 1250.5,
          change: 5.2,
          changePercent: 0.42,
          currency: "EUR",
        },
      ],
      isLoading: false,
      error: null,
    });

    render(<MacroCards />);

    expect(screen.getByText("Zero Asset")).toBeInTheDocument();
    expect(screen.getByText("$0.00")).toBeInTheDocument();
    expect(screen.getByText("+0.00 (+0.00%)")).toBeInTheDocument();

    expect(screen.getByText("Euro Index")).toBeInTheDocument();
    expect(screen.getByText("€1,250.50")).toBeInTheDocument();
  });
});
