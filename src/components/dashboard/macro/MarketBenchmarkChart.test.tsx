/**
 * Unit tests for MarketBenchmarkChart component.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MarketBenchmarkChart, {
  BenchmarkTooltip,
  formatBenchmarkTick,
  calculateBenchmarkYDomain,
  computeBenchmarkTicks,
} from "./MarketBenchmarkChart";
import useYahooBasicHistoricalData from "@/hooks/useYahooBasicHistoricalData";

vi.mock("@/hooks/useYahooBasicHistoricalData");

describe("MarketBenchmarkChart component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders benchmark title and timeframe selectors with 1Y active", () => {
    vi.mocked(useYahooBasicHistoricalData).mockReturnValue({
      historicalData: [
        { date: "2024-01-01", close: 5000, volume: 100000, time: "10:00 AM" },
        { date: "2024-02-01", close: 5100, volume: 120000, time: "11:00 AM" },
      ],
      isLoading: false,
      isFetching: false,
      isPlaceholderData: false,
      error: null,
    });

    render(<MarketBenchmarkChart />);

    expect(screen.getByText("S&P 500 Performance")).toBeInTheDocument();
    expect(screen.getByText("^GSPC")).toBeInTheDocument();

    const btn1Y = screen.getByRole("button", { name: "1Y" });
    expect(btn1Y).toHaveAttribute("aria-pressed", "true");

    const btn5D = screen.getByRole("button", { name: "5D" });
    expect(btn5D).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(btn5D);

    expect(useYahooBasicHistoricalData).toHaveBeenCalledWith("^GSPC", "5d");

    const btn3M = screen.getByRole("button", { name: "3M" });
    expect(btn3M).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(btn3M);

    expect(useYahooBasicHistoricalData).toHaveBeenCalledWith("^GSPC", "3m");
  });

  it("allows switching benchmark index", () => {
    vi.mocked(useYahooBasicHistoricalData).mockReturnValue({
      historicalData: [],
      isLoading: false,
      isPlaceholderData: false,
      isFetching: false,
      error: null,
    });

    render(<MarketBenchmarkChart />);

    const nasdaqBtn = screen.getByRole("button", { name: "NASDAQ" });
    fireEvent.click(nasdaqBtn);

    expect(nasdaqBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("NASDAQ Performance")).toBeInTheDocument();
    expect(screen.getByText("^IXIC")).toBeInTheDocument();
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

  describe("formatBenchmarkTick helper", () => {
    it("handles empty values gracefully", () => {
      expect(formatBenchmarkTick("", "1y")).toBe("");
    });

    it("returns raw val for 1d intraday timestamps", () => {
      expect(formatBenchmarkTick("09:30 AM", "1d")).toBe("09:30 AM");
    });

    it("formats 5d ticks with weekday and day of month", () => {
      const formatted = formatBenchmarkTick("2024-05-15T00:00:00Z", "5d");
      expect(formatted).toMatch(/Wed/);
    });

    it("formats 1m and 3m ranges with month and day", () => {
      expect(formatBenchmarkTick("2024-05-15T00:00:00Z", "1m")).toBe("May 15");
      expect(formatBenchmarkTick("2024-05-15T00:00:00Z", "3m")).toBe("May 15");
    });

    it("formats multi-month/year ranges with month and year", () => {
      const formatted = formatBenchmarkTick("2024-05-15T00:00:00Z", "1y");
      expect(formatted).toMatch(/May/);
    });

    it("handles unparseable date strings gracefully", () => {
      expect(formatBenchmarkTick("not-a-date", "1y")).toBe("not-a-date");
    });
  });

  describe("calculateBenchmarkYDomain helper", () => {
    it("returns ['auto', 'auto'] when series is empty or has only non-finite values", () => {
      expect(calculateBenchmarkYDomain([])).toEqual(["auto", "auto"]);
      expect(
        calculateBenchmarkYDomain([
          { date: "2024-01-01", time: "", close: undefined as unknown as number, volume: 0 },
          { date: "2024-01-02", time: "", close: NaN, volume: 0 },
        ])
      ).toEqual(["auto", "auto"]);
    });

    it("returns padded min and max bounds for valid price data", () => {
      const series = [
        { date: "2024-01-01", time: "", close: 100, volume: 1000 },
        { date: "2024-01-02", time: "", close: 200, volume: 2000 },
      ];
      const [min, max] = calculateBenchmarkYDomain(series);
      expect(min).toBe(98);
      expect(max).toBe(204);
    });
  });

  describe("computeBenchmarkTicks helper", () => {
    it("returns empty array for empty series", () => {
      expect(computeBenchmarkTicks([], "1y")).toEqual([]);
    });

    it("deduplicates 5d series to one tick per distinct date", () => {
      const series = [
        { date: "2024-05-01", time: "09:30", close: 100, volume: 10 },
        { date: "2024-05-01", time: "10:00", close: 101, volume: 20 },
        { date: "2024-05-02", time: "09:30", close: 102, volume: 15 },
        { date: "2024-05-02", time: "10:00", close: 103, volume: 25 },
        { date: "2024-05-03", time: "09:30", close: 104, volume: 12 },
      ];
      const ticks = computeBenchmarkTicks(series, "5d");
      expect(ticks).toEqual(["2024-05-01", "2024-05-02", "2024-05-03"]);
    });

    it("samples at most 6 evenly-spaced unique ticks for multi-month series", () => {
      const series = Array.from({ length: 20 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, "0")}`,
        time: "",
        close: 100 + i,
        volume: 1000,
      }));
      const ticks = computeBenchmarkTicks(series, "1m");
      expect(ticks.length).toBeLessThanOrEqual(6);
      expect(ticks[0]).toBe("2024-01-01");
      expect(ticks[ticks.length - 1]).toBe("2024-01-20");
    });
  });

  describe("BenchmarkTooltip", () => {
    it("returns null when inactive or payload is empty", () => {
      const { container: c1 } = render(<BenchmarkTooltip active={false} payload={[]} />);
      expect(c1.firstChild).toBeNull();

      const { container: c2 } = render(
        <BenchmarkTooltip active={true} payload={[]} />
      );
      expect(c2.firstChild).toBeNull();
    });

    it("renders formatted date, time, price, and volume when active", () => {
      render(
        <BenchmarkTooltip
          active={true}
          payload={[
            {
              payload: {
                date: "2024-01-15T00:00:00Z",
                time: "10:30 AM",
                close: 5050.25,
                volume: 4500000,
              },
            },
          ]}
        />
      );

      expect(screen.getByText(/10:30 AM/)).toBeInTheDocument();
      expect(screen.getByText("$5.05K")).toBeInTheDocument();
      expect(screen.getByText(/Vol: 4.5M/)).toBeInTheDocument();
    });

    it("handles null close and volume gracefully", () => {
      render(
        <BenchmarkTooltip
          active={true}
          payload={[
            {
              payload: {
                date: "2024-01-15T00:00:00Z",
                time: "",
                close: null as unknown as number,
                volume: null as unknown as number,
              },
            },
          ]}
        />
      );

      expect(screen.getByText("N/A")).toBeInTheDocument();
      expect(screen.queryByText(/Vol:/)).not.toBeInTheDocument();
    });
  });
});
