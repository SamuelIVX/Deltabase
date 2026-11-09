/**
 * Unit tests for institutional Footer component.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./footer";

describe("Footer component", () => {
  it("renders brand, copyright with current year, and financial disclaimer", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByText("DeltaBase")).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`Samuel Hernandez Balderas`, "i"))
    ).toBeInTheDocument();
    expect(
      screen.getByText(/informational and educational purposes only/i)
    ).toBeInTheDocument();
  });
});
