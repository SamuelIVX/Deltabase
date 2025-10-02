const formatCurrency = (value: number) => {
    if (!value) return 'N/A';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2
    }).format(value);
};

export default formatCurrency;