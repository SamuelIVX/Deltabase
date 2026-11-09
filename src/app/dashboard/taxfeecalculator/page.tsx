/**
 * Tax/fee calculator page — mounts the adjusted-returns calculator component.
 */
import React from 'react';
import TaxAdjustedReturns from '@/components/taxfeecalculator/taxfeecalculator';

/**
 * Renders the tax-adjusted returns calculator page.
 * @returns {JSX.Element}
 */
const Calculator: React.FC = () => {
    return (
        <div>
            <TaxAdjustedReturns />
        </div>
    );
};

export default Calculator;
