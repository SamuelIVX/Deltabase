import { useMemo } from 'react';

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