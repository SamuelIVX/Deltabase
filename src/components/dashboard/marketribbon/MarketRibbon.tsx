"use client";

/**
 * Top Market Indices Ribbon — displays live pulse on major indexes and crypto benchmarks.
 */
import type { JSX } from "react";
import { useMarketIndices } from "@/hooks/useMarketIndices";
import styles from "./MarketRibbon.module.css";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";

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

  const tickerItems = [...indices, ...indices];

  return (
    <div
      className={styles.ribbon}
      role="region"
      aria-label="Live market benchmark indices"
    >
      <div className={styles.track}>
        {tickerItems.map((idx, index) => {
          const isDuplicate = index >= indices.length;
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
  );
}
