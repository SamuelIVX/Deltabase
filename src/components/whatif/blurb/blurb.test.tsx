/**
 * Unit tests for What-If Blurb component.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Blurb from "./blurb";

describe("Blurb component", () => {
    it("renders headline title and institutional description", () => {
        render(<Blurb />);
        expect(screen.getByText("What-If Investment Calculator")).toBeInTheDocument();
        expect(screen.getByText("Backtest Engine")).toBeInTheDocument();
        expect(
            screen.getByText(/Simulate disciplined dollar-cost averaging/i)
        ).toBeInTheDocument();
    });
});
