"use client";
/**
 * Macro market indicator cards displaying real-time benchmark index figures
 * (S&P 500, NASDAQ, Dow Jones, Bitcoin) powered by useMarketIndices.
 */
import React from "react";
import styles from "./MacroCards.module.css";
import useMarketIndices from "@/hooks/useMarketIndices";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";

const MACRO_SYMBOLS = ["^GSPC", "^IXIC", "^DJI", "BTC-USD"];

/**
 * MacroCards component rendering benchmark market index snapshots.
 * Replaces legacy hardcoded personal portfolio overview cards.
 * @returns {JSX.Element} Grid items with live price and point/percent movements.
 */
export default function MacroCards(): React.JSX.Element {
  const { indices, isLoading } = useMarketIndices();

  if (isLoading && indices.length === 0) {
    return (
      <div className={styles.container} role="region" aria-label="Macro market indicators">
        {[1, 2, 3, 4].map((id) => (
          <div key={id} className={styles.skeletonCard} aria-hidden="true">
            <div className={styles.skeletonLineSm} />
            <div className={styles.skeletonLineLg} />
            <div className={styles.skeletonLineSm} />
          </div>
        ))}
      </div>
    );
  }

  const activeIndices = MACRO_SYMBOLS.map((sym) =>
    indices.find((item) => item.symbol.toUpperCase() === sym.toUpperCase())
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));

  // Fallback to all indices if none matched predefined list
  const displayList = activeIndices.length > 0 ? activeIndices : indices.slice(0, 4);

  return (
    <div className={styles.container} role="region" aria-label="Macro market indicators">
      {displayList.map((item) => {
        const isNullChange = item.change == null;
        const isPositive = item.change != null && item.change >= 0;
        const changeSign = isPositive ? "+" : "";
        const formattedPrice =
          item.price != null && item.price
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(item.price)
            : "N/A";
        const formattedChange =
          item.change != null
            ? `${changeSign}${item.change.toFixed(2)}`
            : "N/A";
        const formattedPercent =
          item.changePercent != null
            ? `${changeSign}${item.changePercent.toFixed(2)}%`
            : "N/A";

        return (
          <div key={item.symbol} className={styles.card}>
            <div className={styles.header}>
              <div className={styles.titleGroup}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.symbolBadge}>{item.symbol}</span>
              </div>
              {!isNullChange && (
                isPositive ? (
                  <MdTrendingUp className={styles.iconPositive} aria-hidden="true" />
                ) : (
                  <MdTrendingDown className={styles.iconNegative} aria-hidden="true" />
                )
              )}
            </div>

            <div className={styles.price}>{formattedPrice}</div>

            <div className={styles.changeRow}>
              <span
                className={
                  isNullChange
                    ? styles.neutral
                    : isPositive
                    ? styles.positive
                    : styles.negative
                }
              >
                {formattedChange} ({formattedPercent})
              </span>
              <span className={styles.period}>Today</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
