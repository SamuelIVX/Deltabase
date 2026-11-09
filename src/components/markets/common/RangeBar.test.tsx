/**
 * Unit tests for the shared RangeBar component.
 * Verifies bounds validation, accessible meter attributes, and nullish current handling.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RangeBar from "./RangeBar";

describe("RangeBar component", () => {
    it("returns null when low, high, or inverted range is provided", () => {
        const { container: c1 } = render(<RangeBar label="52W" low={undefined} high={100} current={50} />);
        expect(c1).toBeEmptyDOMElement();

        const { container: c2 } = render(<RangeBar label="52W" low={100} high={50} current={75} />);
        expect(c2).toBeEmptyDOMElement();

        const { container: c3 } = render(<RangeBar label="52W" low={100} high={100} current={100} />);
        expect(c3).toBeEmptyDOMElement();
    });

    it("renders meter element with accessible attributes and clamped values when current is provided", () => {
        render(<RangeBar label="52-Week Range" low={100} high={200} current={150} />);
        const meter = screen.getByRole("meter", { name: "52-Week Range" });
        expect(meter).toHaveAttribute("aria-valuemin", "100");
        expect(meter).toHaveAttribute("aria-valuemax", "200");
        expect(meter).toHaveAttribute("aria-valuenow", "150");
        expect(screen.getByText("Current: $150")).toBeInTheDocument();
        expect(screen.getByText("$100")).toBeInTheDocument();
        expect(screen.getByText("$200")).toBeInTheDocument();
    });

    it("clamps aria-valuenow to high bound if current price exceeds high", () => {
        render(<RangeBar label="52-Week Range" low={100} high={200} current={250} />);
        const meter = screen.getByRole("meter", { name: "52-Week Range" });
        expect(meter).toHaveAttribute("aria-valuenow", "200");
        expect(screen.getByText("Current: $250")).toBeInTheDocument();
    });

    it("renders sub-dollar asset prices with appropriate decimal precision", () => {
        render(<RangeBar label="52-Week Range" low={0.08} high={0.25} current={0.125} />);
        expect(screen.getByText("$0.08")).toBeInTheDocument();
        expect(screen.getByText("$0.25")).toBeInTheDocument();
        expect(screen.getByText("Current: $0.125")).toBeInTheDocument();
    });

    it("renders decorative track with aria-hidden and omits meter role when current is omitted", () => {
        const { container } = render(<RangeBar label="Year Range" low={100} high={200} />);
        expect(screen.queryByRole("meter")).not.toBeInTheDocument();
        const track = container.querySelector('[aria-hidden="true"]');
        expect(track).toBeInTheDocument();
        expect(screen.queryByText(/Current:/i)).not.toBeInTheDocument();
        expect(screen.getByText("$100")).toBeInTheDocument();
        expect(screen.getByText("$200")).toBeInTheDocument();
    });
});
