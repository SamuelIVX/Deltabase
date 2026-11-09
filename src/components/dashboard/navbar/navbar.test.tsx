/**
 * Unit tests for Navbar component.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "./navbar";
import * as navigationModule from "next/navigation";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Market Dashboard metadata when on /dashboard", () => {
    vi.spyOn(navigationModule, "usePathname").mockReturnValue("/dashboard");

    render(<Navbar />);
    expect(screen.getByRole("heading", { level: 1, name: "Market Dashboard" })).toBeDefined();
    expect(screen.getByText(/Real-time market indices/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Switch to light theme/i })).toBeDefined();
  });

  it("renders What-If Simulator metadata when on /dashboard/whatif", () => {
    vi.spyOn(navigationModule, "usePathname").mockReturnValue("/dashboard/whatif");

    render(<Navbar />);
    expect(screen.getByRole("heading", { level: 1, name: "What-If Simulator" })).toBeDefined();
    expect(screen.getByText(/Historical Dollar-Cost Averaging/i)).toBeDefined();
  });

  it("renders Stock Market metadata when on /dashboard/stockmarket", () => {
    vi.spyOn(navigationModule, "usePathname").mockReturnValue("/dashboard/stockmarket");

    render(<Navbar />);
    expect(screen.getByRole("heading", { level: 1, name: "Stock Market" })).toBeDefined();
    expect(screen.getByText(/Live quotes, ETF metrics/i)).toBeDefined();
  });

  it("renders fallback title when route is unknown or pathname is null", () => {
    vi.spyOn(navigationModule, "usePathname").mockReturnValue(null as never);

    render(<Navbar />);
    expect(screen.getByRole("heading", { level: 1, name: "Market Dashboard" })).toBeDefined();
  });
});
