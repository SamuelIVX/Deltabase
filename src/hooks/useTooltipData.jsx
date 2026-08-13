/**
 * Derives Recharts tooltip fields (label, delta %) for What-If portfolio series.
 */
import { useMemo } from 'react';

/**
 * Builds tooltip display data from the active Recharts payload and full series.
 * @param {boolean} active - Whether the tooltip is currently active.
 * @param {Array} payload - Recharts tooltip payload for the hovered point.
 * @param {Array} data - Full monthly portfolio series (`name`, `portfolioValue`, …).
 * @returns {object|null} Tooltip fields (`label`, `value`, `performance`, …) or null when inactive.
 * @example
 * const tip = useTooltipData(active, payload, monthlyPortfolio);
 * // tip?.formattedValue, tip?.performance
 */
const useTooltipData = (active, payload, data) => {
    return useMemo(() => {
        if (!active || !payload?.[0] || !data) {
            return null;
        }

        const { value, name, color } = payload[0];
        const label = payload[0].payload.name;
        const currentIndex = data.findIndex(item => item.name === label);

        const current = value;
        const prev = currentIndex > 0 ? data[currentIndex - 1].portfolioValue : null;
        const performance = prev !== null && prev !== 0
            ? ((current - prev) / prev * 100).toFixed(2)
            : null;

        return {
            label,
            value,
            name,
            color,
            performance,
            formattedValue: value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        };
    }, [active, payload, data]);
};

export default useTooltipData;
