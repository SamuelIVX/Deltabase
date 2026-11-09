/**
 * Unit tests for TaxBreakdownChart component.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TaxBreakdownChart from "./TaxBreakdownChart";
import type { TaxReturnsBreakdown } from "@/types/tax";

describe("TaxBreakdownChart", () => {
    const mockGainBreakdown: TaxReturnsBreakdown = {
        initialInvestment: 1000,
        grossProfit: 200,
        feeCost: 22,
        taxableProfit: 178,
        taxAmount: 35.6,
        netProfit: 142.4,
        netReturn: 14.24,
        totalExitValue: 1142.4,
    };

    const mockLossBreakdown: TaxReturnsBreakdown = {
        initialInvestment: 5000,
        grossProfit: -500,
        feeCost: 20,
        taxableProfit: -520,
        taxAmount: 0,
        netProfit: -520,
        netReturn: -10.4,
        totalExitValue: 4480,
    };

    it("renders gain breakdown with all metric cards and visual breakdown bar", () => {
        render(<TaxBreakdownChart breakdown={mockGainBreakdown} symbol="AAPL" />);

        expect(screen.getByText("AAPL Proceeds & Drag Breakdown")).toBeInTheDocument();
        expect(screen.getByText("$1,142.40")).toBeInTheDocument(); // Net Take-Home
        expect(screen.getByText("Cost Basis")).toBeInTheDocument();
        expect(screen.getByText("$1,000.00")).toBeInTheDocument();
        expect(screen.getByText("Fee Drag")).toBeInTheDocument();
        expect(screen.getByText("-$22.00")).toBeInTheDocument();
        expect(screen.getByText("Tax Drag")).toBeInTheDocument();
        expect(screen.getByText("-$35.60")).toBeInTheDocument();
        expect(screen.getByText("Net Retained")).toBeInTheDocument();
        expect(screen.getByText("+$142.40")).toBeInTheDocument();

        const bar = screen.getByRole("img", { name: /proceeds breakdown/i });
        expect(bar).toBeInTheDocument();
        expect(screen.getByText(/total friction drag/i)).toBeInTheDocument();
    });

    it("renders loss breakdown with negative net loss card and capital preservation bar", () => {
        render(<TaxBreakdownChart breakdown={mockLossBreakdown} />);

        expect(screen.getByText("Proceeds & Drag Breakdown")).toBeInTheDocument();
        expect(screen.getByText("Net Loss")).toBeInTheDocument();
        expect(screen.getByText("-$520.00")).toBeInTheDocument();
        expect(screen.getByText("0.0% retained")).toBeInTheDocument();

        const bar = screen.getByRole("img", { name: /capital preservation breakdown/i });
        expect(bar).toBeInTheDocument();
    });

    it("renders gross gain scenario where fees cause net loss", () => {
        const mockGrossGainNetLoss: TaxReturnsBreakdown = {
            initialInvestment: 1000,
            grossProfit: 10,
            feeCost: 30,
            taxableProfit: -20,
            taxAmount: 0,
            netProfit: -20,
            netReturn: -2,
            totalExitValue: 980,
        };

        render(<TaxBreakdownChart breakdown={mockGrossGainNetLoss} symbol="SPY" />);

        expect(screen.getByText("SPY Proceeds & Drag Breakdown")).toBeInTheDocument();
        const bar = screen.getByRole("img", { name: /net loss \$20\.00/i });
        expect(bar).toBeInTheDocument();
        expect(screen.getByText("-$20.00")).toBeInTheDocument();
        expect(screen.getByText("0.0% retained")).toBeInTheDocument();
    });
});
