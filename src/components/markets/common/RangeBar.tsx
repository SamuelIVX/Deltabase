"use client";
/**
 * Visual price range bar (e.g. 52-Week Range or Year Range).
 * Accessible HTML meter with low/high bounds and optional current-price marker.
 * Dynamically adjusts decimal precision for sub-dollar and low-priced assets.
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
 * Formats a price value with fractional precision determined by the reference magnitude.
 * @param value - Amount to format.
 * @param reference - High bound or range magnitude used to select decimal precision.
 * @returns Formatted USD currency string.
 */
function formatRangeCurrency(value: number, reference: number): string {
    let maxDigits = 2;
    if (reference < 0.01) {
        maxDigits = 6;
    } else if (reference < 1) {
        maxDigits = 4;
    } else if (reference < 10) {
        maxDigits = 3;
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDigits,
    }).format(value);
}

/**
 * Accessible visual range slider meter.
 * @param props - Range bar configuration including label, low, high, and optional current price.
 * @returns {JSX.Element | null} Meter element, or null if range bounds are invalid.
 */
const RangeBar: React.FC<RangeBarProps> = ({ label, low, high, current }) => {
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

    const referenceMagnitude = Math.abs(high);

    return (
        <div className={styles.rangeSection}>
            <div className={styles.rangeHeader}>
                <span className={styles.rangeLabel}>{label}</span>
                <div className={styles.rangeValues}>
                    <span className={styles.rangeBound}>
                        {formatRangeCurrency(low, referenceMagnitude)}
                    </span>
                    {hasCurrent && (
                        <span className={styles.rangeCurrent}>
                            Current: {formatRangeCurrency(current as number, referenceMagnitude)}
                        </span>
                    )}
                    <span className={styles.rangeBound}>
                        {formatRangeCurrency(high, referenceMagnitude)}
                    </span>
                </div>
            </div>
            {hasCurrent ? (
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
            ) : (
                <div className={styles.rangeTrack} aria-hidden="true">
                    <div className={styles.rangeFill} style={{ width: "0%" }} />
                </div>
            )}
        </div>
    );
};

export default RangeBar;
