/**
 * Derives Recharts tooltip fields (label, delta %) for portfolio series.
 */
import { useMemo } from 'react';

export interface TooltipItem {
    name?: string;
    portfolioValue?: string | number;
}

export interface DerivedTooltipData {
    label: string;
    value: number;
    name?: string;
    color?: string;
    performance: string | null;
    formattedValue: string;
}

/**
 * Builds tooltip display data from the active Recharts payload and full series.
 */
const useTooltipData = (
    active?: boolean,
    payload?: Array<{ value: number; name?: string; color?: string; payload: { name: string } }>,
    data?: TooltipItem[]
): DerivedTooltipData | null => {
    return useMemo(() => {
        if (!active || !payload?.[0] || !data) {
            return null;
        }

        const { value, name, color } = payload[0];
        const label = payload[0].payload.name;
        const currentIndex = data.findIndex((item) => item.name === label);

        const current = value;
        const prevRaw = currentIndex > 0 ? data[currentIndex - 1].portfolioValue : null;
        const prev = prevRaw != null ? Number(prevRaw) : null;
        const performance =
            prev !== null && prev !== 0 && Number.isFinite(prev)
                ? (((current - prev) / prev) * 100).toFixed(2)
                : null;

        return {
            label,
            value,
            name,
            color,
            performance,
            formattedValue: value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        };
    }, [active, payload, data]);
};

export default useTooltipData;
