"use client";

/**
 * Top Market Indices Ribbon — displays live pulse on major indexes and crypto benchmarks.
 */
import { useState } from "react";
import type { JSX } from "react";
import { useMarketIndices } from "@/hooks/useMarketIndices";
import styles from "./MarketRibbon.module.css";
import { MdTrendingUp, MdTrendingDown, MdPause, MdPlayArrow } from "react-icons/md";

/**
 * Formats a numeric price into a localized currency string.
 * @param price - Raw price number or null if unavailable.
 * @returns Localized dollar string or placeholder.
 */
function formatPrice(price: number | null): string {
  if (price === null) return "—";
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats percent return with positive/negative sign.
 * @param pct - Percentage float or null if unavailable.
 * @returns Formatted percentage string or placeholder.
 */
function formatPercent(pct: number | null): string {
  if (pct === null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

/**
 * Renders the top market ribbon with live prices and gain/loss indicators.
 * @returns The rendered market ribbon.
 */
export default function MarketRibbon(): JSX.Element {
  const { indices, isLoading, error } = useMarketIndices();
  const [isPaused, setIsPaused] = useState(false);

  if (isLoading && indices.length === 0) {
    return (
      <div
        className={styles.ribbon}
        role="region"
        aria-label="Market benchmark indices loading"
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.skeletonItem}>
            <div className={styles.skeletonBox} />
            <div className={styles.skeletonBadge} />
          </div>
        ))}
      </div>
    );
  }

  if (error && indices.length === 0) {
    return (
      <div
        className={styles.ribbon}
        role="region"
        aria-label="Market benchmark indices error"
      >
        <span className={styles.errorState}>Market indices temporarily unavailable</span>
      </div>
    );
  }

  if (indices.length === 0) {
    return <></>;
  }

  // Ensure enough items in one cycle so track is wide enough for 50% translation with small datasets
  const repeatCount = indices.length > 0 && indices.length < 6 ? Math.ceil(6 / indices.length) : 1;
  const baseItems = repeatCount > 1
    ? Array.from({ length: repeatCount }, () => indices).flat()
    : indices;
  const tickerItems = [...baseItems, ...baseItems];

  return (
    <div
      className={styles.ribbon}
      role="region"
      aria-label="Live market benchmark indices"
    >
      <button
        type="button"
        className={styles.pauseButton}
        onClick={() => setIsPaused((prev) => !prev)}
        aria-label={isPaused ? "Resume market ticker" : "Pause market ticker"}
        title={isPaused ? "Resume market ticker" : "Pause market ticker"}
      >
        {isPaused ? <MdPlayArrow size={14} aria-hidden="true" /> : <MdPause size={14} aria-hidden="true" />}
      </button>

      <div className={styles.trackContainer}>
        <div className={`${styles.track} ${isPaused ? styles.trackPaused : ""}`}>
          {tickerItems.map((idx, index) => {
            const isDuplicate = index >= baseItems.length;
            const isPositive = typeof idx.changePercent === "number" && idx.changePercent > 0;
            const isNegative = typeof idx.changePercent === "number" && idx.changePercent < 0;
            const badgeClass = isPositive
              ? styles.gain
              : isNegative
              ? styles.loss
              : styles.neutral;
            const itemClassName = isDuplicate
              ? `${styles.item} ${styles.duplicateItem}`
              : styles.item;

            return (
              <div
                key={`${idx.symbol}-${index}`}
                className={itemClassName}
                title={`${idx.name} (${idx.symbol})`}
                aria-hidden={isDuplicate ? true : undefined}
              >
                <span className={styles.name}>{idx.name}</span>
                <span className={styles.price}>{formatPrice(idx.price)}</span>
                <span className={`${styles.badge} ${badgeClass}`}>
                  <span className={styles.srOnly}>{idx.name} change: </span>
                  {isPositive && <MdTrendingUp size={12} aria-hidden="true" />}
                  {isNegative && <MdTrendingDown size={12} aria-hidden="true" />}
                  {formatPercent(idx.changePercent)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
