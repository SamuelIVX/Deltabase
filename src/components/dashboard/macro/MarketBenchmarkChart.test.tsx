/**
 * Unit tests for MarketBenchmarkChart component.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MarketBenchmarkChart from "./MarketBenchmarkChart";
import useYahooBasicHistoricalData from "@/hooks/useYahooBasicHistoricalData";

vi.mock("@/hooks/useYahooBasicHistoricalData");

describe("MarketBenchmarkChart component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders benchmark title and timeframe selectors with 1Y active", () => {
    vi.mocked(useYahooBasicHistoricalData).mockReturnValue({
      historicalData: [
        { date: "2024-01-01", close: 5000, volume: 100000 },
        { date: "2024-02-01", close: 5100, volume: 120000 },
      ],
      isLoading: false,
      isFetching: false,
      isPlaceholderData: false,
      error: null,
    });

    render(<MarketBenchmarkChart />);

    expect(screen.getByText("S&P 500 Benchmark Performance")).toBeInTheDocument();
    expect(screen.getByText("^GSPC")).toBeInTheDocument();

    const btn1Y = screen.getByRole("button", { name: "1Y" });
    expect(btn1Y).toHaveAttribute("aria-pressed", "true");

    const btn5D = screen.getByRole("button", { name: "5D" });
    expect(btn5D).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(btn5D);

    expect(useYahooBasicHistoricalData).toHaveBeenCalledWith("^GSPC", "5d");
  });

  it("renders loading indicator when fetching without cached series", () => {
    vi.mocked(useYahooBasicHistoricalData).mockReturnValue({
      historicalData: [],
      isLoading: true,
      isFetching: true,
      isPlaceholderData: false,
      error: null,
    });

    render(<MarketBenchmarkChart />);
    expect(screen.getByText(/Loading S&P 500 benchmark data/i)).toBeInTheDocument();
  });

  it("renders error message when fetch fails without cached data", () => {
    vi.mocked(useYahooBasicHistoricalData).mockReturnValue({
      historicalData: [],
      isLoading: false,
      isFetching: false,
      isPlaceholderData: false,
      error: "Upstream failure",
    });

    render(<MarketBenchmarkChart />);
    expect(
      screen.getByText("Unable to load S&P 500 historical benchmark data.")
    ).toBeInTheDocument();
  });
});
