const formatPercent = (value: number) => {
    if (!value) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
};

export default formatPercent;