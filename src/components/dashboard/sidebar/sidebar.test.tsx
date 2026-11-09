/**
 * Unit tests for Sidebar navigation and collapse toggle behavior.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "./sidebar";
import { SidebarProvider } from "./SidebarContext";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Sidebar component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders branding and direct navigation links without section category header", () => {
    render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    );

    expect(screen.getByText("DeltaBase")).toBeInTheDocument();
    expect(screen.getByText("See the data, not the noise.")).toBeInTheDocument();
    expect(screen.queryByText(/Analytics & Tools/i)).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /What-If Simulator/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Stock Market/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Crypto Market/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tax & Fee Calculator/i })).toBeInTheDocument();
  });

  it("toggles to collapsed mode when collapse button is clicked", () => {
    render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    );

    const collapseBtn = screen.getByRole("button", { name: "Collapse sidebar" });
    fireEvent.click(collapseBtn);

    expect(screen.queryByText("See the data, not the noise.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();

    const expandBtn = screen.getByRole("button", { name: "Expand sidebar" });
    fireEvent.click(expandBtn);

    expect(screen.getByText("See the data, not the noise.")).toBeInTheDocument();
  });
});
