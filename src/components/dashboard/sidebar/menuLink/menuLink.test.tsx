/**
 * Unit tests for MenuLink in both expanded and collapsed sidebar modes.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MenuLink from "./menuLink";
import SidebarContext from "../SidebarContext";
import { MdDashboard } from "react-icons/md";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("MenuLink", () => {
  const item = {
    title: "Dashboard",
    path: "/dashboard",
    icon: <MdDashboard data-testid="icon" />,
  };

  it("renders icon and title text when expanded", () => {
    render(
      <SidebarContext.Provider
        value={{ isCollapsed: false, toggleSidebar: vi.fn(), setIsCollapsed: vi.fn() }}
      >
        <MenuLink item={item} />
      </SidebarContext.Provider>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
  });

  it("renders only icon with title tooltip and aria-label when collapsed", () => {
    const { container } = render(
      <SidebarContext.Provider
        value={{ isCollapsed: true, toggleSidebar: vi.fn(), setIsCollapsed: vi.fn() }}
      >
        <MenuLink item={item} />
      </SidebarContext.Provider>
    );

    const tooltip = container.querySelector('[class*="floatingTooltip"]');
    expect(tooltip).toHaveTextContent("Dashboard");
    expect(tooltip).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector('[class*="titleText"]')).toBeNull();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link).toHaveAttribute("href", "/dashboard");
  });
});
