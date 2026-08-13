/**
 * Tax/fee calculator page — mounts the adjusted-returns calculator component.
 */
import TaxFreeCalculator from "@/components/taxfreecalculator/taxfreecalculator"

/**
 * Renders the tax-adjusted returns calculator.
 * @returns {JSX.Element}
 */
const Calculator = () => {

    return (
        <div>
            <TaxFreeCalculator />
        </div>
    );
};

export default Calculator;