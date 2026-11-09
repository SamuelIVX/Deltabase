"use client";
/**
 * Visual price range bar (e.g. 52-Week Range or Year Range).
 * Accessible HTML meter with low/high bounds and optional current-price marker.
 */
import React from "react";
import styles from "../marketsmetrics.module.css";

export interface RangeBarProps {
    label: string;
    low: number | null | undefined;
    high: number | null | undefined;
    current?: number | null | undefined;
}

/**
 * Accessible visual range slider meter.
 * @param props - Range bar configuration including label, low, high, and optional current price.
 * @returns {JSX.Element | null} Meter element, or null if range bounds are invalid.
 */
export const RangeBar: React.FC<RangeBarProps> = ({ label, low, high, current }) => {
    if (low == null || high == null || high <= low) {
        return null;
    }

    const hasCurrent = current != null && Number.isFinite(current);
    const clampedPrice = hasCurrent
        ? Math.min(Math.max(current as number, low), high)
        : undefined;
    const percent = clampedPrice != null
        ? Math.min(100, Math.max(0, ((clampedPrice - low) / (high - low)) * 100))
        : undefined;

    return (
        <div className={styles.rangeSection}>
            <div className={styles.rangeHeader}>
                <span className={styles.rangeLabel}>{label}</span>
                <div className={styles.rangeValues}>
                    <span className={styles.rangeBound}>${low}</span>
                    {hasCurrent && (
                        <span className={styles.rangeCurrent}>
                            Current: ${current}
                        </span>
                    )}
                    <span className={styles.rangeBound}>${high}</span>
                </div>
            </div>
            <div
                className={styles.rangeTrack}
                role="meter"
                aria-label={label}
                aria-valuemin={low}
                aria-valuemax={high}
                aria-valuenow={clampedPrice}
            >
                {percent != null && (
                    <>
                        <div
                            className={styles.rangeFill}
                            style={{ width: `${percent.toFixed(1)}%` }}
                        />
                        <div
                            className={styles.rangeThumb}
                            style={{ left: `${percent.toFixed(1)}%` }}
                            aria-hidden="true"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default RangeBar;
