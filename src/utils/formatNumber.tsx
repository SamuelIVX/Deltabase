const formatNumber = (value: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2
    }).format(value);
};

export default formatNumber;