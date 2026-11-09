"use client";
/**
 * Interactive benchmark area chart supporting S&P 500, NASDAQ, Dow Jones, and Bitcoin with timeframe controls.
 * Replaces legacy hardcoded weekly line chart on the dashboard home.
 */
import React, { useState } from "react";
import styles from "./MarketBenchmarkChart.module.css";
import useYahooBasicHistoricalData from "@/hooks/useYahooBasicHistoricalData";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import { MoonLoader } from "react-spinners";
import formatDate from "@/utils/formatDate";
import formatNumber from "@/utils/formatNumber";
import formatCurrency from "@/utils/formatCurrency";
import { SymbolDataPoint } from "@/types/dataPoints";

export interface BenchmarkOption {
  label: string;
  symbol: string;
  name: string;
}

export const BENCHMARK_OPTIONS: BenchmarkOption[] = [
  { label: "S&P 500", symbol: "^GSPC", name: "S&P 500" },
  { label: "NASDAQ", symbol: "^IXIC", name: "NASDAQ" },
  { label: "Dow Jones", symbol: "^DJI", name: "Dow Jones" },
  { label: "Bitcoin", symbol: "BTC-USD", name: "Bitcoin" },
];

const TIMEFRAMES = [
  { label: "1D", value: "1d" },
  { label: "5D", value: "5d" },
  { label: "1M", value: "1m" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
];

/**
 * Formats XAxis date ticks according to selected range.
 * @param val - Date string or timestamp.
 * @param selectedRange - Current range timeframe (e.g. "1d", "5d", "1m", "1y").
 * @returns Formatted tick string.
 */
export function formatBenchmarkTick(val: string, selectedRange: string): string {
  if (!val) return "";
  if (selectedRange === "1d") return val;
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  if (selectedRange === "5d") {
    return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", timeZone: "UTC" });
  }
  if (selectedRange === "1m") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

/**
 * Computes deduplicated, evenly-spaced ticks for the benchmark X-axis.
 * Prevents tick clustering and duplicate day/month labels.
 * @param series - Historical symbol data points.
 * @param range - Selected range identifier.
 * @returns Array of unique tick identifiers.
 */
export function computeBenchmarkTicks(series: SymbolDataPoint[], range: string): string[] {
  if (!series || series.length === 0) return [];
  const key = range === "1d" ? "time" : "date";
  const rawValues = series.map((pt) => pt[key]).filter((v): v is string => Boolean(v));
  if (rawValues.length === 0) return [];

  // For 5d range, pick the first point for each distinct date to eliminate duplicates
  if (range === "5d") {
    const uniqueDates: string[] = [];
    const seen = new Set<string>();
    for (const pt of series) {
      if (pt.date && !seen.has(pt.date)) {
        seen.add(pt.date);
        uniqueDates.push(pt.date);
      }
    }
    return uniqueDates;
  }

  const uniqueValues = Array.from(new Set(rawValues));
  if (uniqueValues.length <= 6) {
    return uniqueValues;
  }

  const count = Math.min(6, uniqueValues.length);
  const step = (uniqueValues.length - 1) / (count - 1);
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round(i * step);
    selected.push(uniqueValues[idx]);
  }
  return Array.from(new Set(selected));
}

/**
 * Calculates domain [min, max] for the YAxis based on series points.
 * Explicitly guards against empty or non-finite inputs.
 * @param series - Symbol data points.
 * @returns Y-axis domain tuple.
 */
export function calculateBenchmarkYDomain(series: SymbolDataPoint[]): [number | string, number | string] {
  const closes = series
    .map((d: SymbolDataPoint) => d.close)
    .filter((c): c is number => typeof c === "number" && Number.isFinite(c));

  if (closes.length === 0) return ["auto", "auto"];

  const minPrice = Math.min(...closes);
  const maxPrice = Math.max(...closes);

  return minPrice > 0 && maxPrice > 0
    ? [Math.floor(minPrice * 0.98), Math.ceil(maxPrice * 1.02)]
    : ["auto", "auto"];
}

/**
 * Glassmorphic hover tooltip for benchmark chart data points.
 * @param props - Tooltip payload and active state from Recharts.
 * @returns Rendered tooltip element or null when inactive.
 */
export const BenchmarkTooltip: React.FC<
  TooltipProps<number, string> & { payload?: { payload: SymbolDataPoint }[] }
> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const closePrice = point.close;

  return (
    <div className={styles.customTooltip}>
      <p className={styles.tooltipDate}>
        {formatDate(point.date)} {point.time ? `• ${point.time}` : ""}
      </p>
      <p className={styles.tooltipPrice}>
        {closePrice != null ? formatCurrency(closePrice) : "N/A"}
      </p>
      {point.volume != null && (
        <p className={styles.tooltipVolume}>Vol: {formatNumber(point.volume)}</p>
      )}
    </div>
  );
};

/**
 * Renders the live interactive benchmark performance chart with selectable index.
 * @returns {JSX.Element} Benchmark chart panel with index and timeframe selectors.
 */
export default function MarketBenchmarkChart(): React.JSX.Element {
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkOption>(
    BENCHMARK_OPTIONS[0]
  );
  const [selectedRange, setSelectedRange] = useState("1y");
  const { historicalData, isLoading, error } = useYahooBasicHistoricalData(
    selectedBenchmark.symbol,
    selectedRange
  );

  const series = Array.isArray(historicalData) ? historicalData : [];
  const yDomain = calculateBenchmarkYDomain(series);
  const computedTicks = computeBenchmarkTicks(series, selectedRange);

  return (
    <div
      className={styles.container}
      role="region"
      aria-label={`${selectedBenchmark.name} Benchmark Performance Chart`}
    >
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{selectedBenchmark.name} Performance</h2>
          <span className={styles.badge}>{selectedBenchmark.symbol}</span>
        </div>

        <div className={styles.controlsRow}>
          <div
            className={styles.benchmarkGroup}
            role="group"
            aria-label="Benchmark selector"
          >
            {BENCHMARK_OPTIONS.map((bm) => (
              <button
                key={bm.symbol}
                type="button"
                aria-pressed={selectedBenchmark.symbol === bm.symbol}
                className={`${styles.benchmarkBtn} ${
                  selectedBenchmark.symbol === bm.symbol
                    ? styles.benchmarkBtnActive
                    : ""
                }`}
                onClick={() => setSelectedBenchmark(bm)}
              >
                {bm.label}
              </button>
            ))}
          </div>

          <div
            className={styles.timeframeGroup}
            role="group"
            aria-label="Timeframe range"
          >
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                type="button"
                aria-pressed={selectedRange === tf.value}
                className={`${styles.timeframeBtn} ${
                  selectedRange === tf.value ? styles.timeframeBtnActive : ""
                }`}
                onClick={() => setSelectedRange(tf.value)}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && series.length === 0 ? (
        <div className={styles.errorState}>
          <p>Unable to load {selectedBenchmark.name} historical benchmark data.</p>
        </div>
      ) : (
        <div className={styles.chartWrapper}>
          {isLoading && series.length === 0 && (
            <div className={styles.loadingOverlay} role="status">
              <MoonLoader color="var(--accent, #3b82f6)" size={48} />
              <span>Loading {selectedBenchmark.name} benchmark data...</span>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="sp500Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent, #38bdf8)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--accent, #38bdf8)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light, #334155)" opacity={0.4} />
              <XAxis
                dataKey={selectedRange === "1d" ? "time" : "date"}
                ticks={computedTicks.length > 0 ? computedTicks : undefined}
                interval={computedTicks.length > 0 ? 0 : "preserveStartEnd"}
                minTickGap={28}
                stroke="var(--border-light, #334155)"
                tick={{ fill: "var(--textSoft, #94a3b8)", fontSize: 11 }}
                tickFormatter={(val: string) => formatBenchmarkTick(val, selectedRange)}
              />
              <YAxis
                domain={yDomain}
                stroke="var(--border-light, #334155)"
                tick={{ fill: "var(--textSoft, #94a3b8)", fontSize: 11 }}
                tickFormatter={(val: number) => `$${Math.round(val).toLocaleString()}`}
              />
              <Tooltip content={<BenchmarkTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="var(--accent, #38bdf8)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#sp500Gradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
