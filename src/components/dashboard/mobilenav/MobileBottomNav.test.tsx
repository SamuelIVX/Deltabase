import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MobileBottomNav from "./MobileBottomNav";

const mockUsePathname = vi.fn(() => "/dashboard/cryptomarket");

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("MobileBottomNav component", () => {
  it("renders all five primary navigation tabs", () => {
    render(<MobileBottomNav />);
    expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /What-If/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Stocks/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Crypto/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tax/i })).toBeInTheDocument();
  });

  it("marks the active route with aria-current", () => {
    render(<MobileBottomNav />);
    const cryptoLink = screen.getByRole("link", { name: /Crypto/i });
    expect(cryptoLink).toHaveAttribute("aria-current", "page");

    const homeLink = screen.getByRole("link", { name: /Home/i });
    expect(homeLink).not.toHaveAttribute("aria-current");
  });

  it("marks parent tab as active for nested child routes", () => {
    mockUsePathname.mockReturnValueOnce("/dashboard/cryptomarket/detail");

    render(<MobileBottomNav />);
    const cryptoLink = screen.getByRole("link", { name: /Crypto/i });
    expect(cryptoLink).toHaveAttribute("aria-current", "page");
  });
});
