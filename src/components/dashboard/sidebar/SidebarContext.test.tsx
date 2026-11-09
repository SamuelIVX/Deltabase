/**
 * Unit tests for SidebarProvider and useSidebar hook.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SidebarProvider, useSidebar } from "./SidebarContext";

const TestConsumer = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();
  return (
    <div>
      <span data-testid="status">{isCollapsed ? "collapsed" : "expanded"}</span>
      <button onClick={toggleSidebar}>Toggle</button>
    </div>
  );
};

describe("SidebarContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to expanded state when no preference is saved", () => {
    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("expanded");
  });

  it("reads stored collapsed preference from localStorage on mount", () => {
    localStorage.setItem("deltabase-sidebar-collapsed", "true");

    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("collapsed");
  });

  it("toggles state and writes to localStorage when toggleSidebar is called", () => {
    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("expanded");

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("status")).toHaveTextContent("collapsed");
    expect(localStorage.getItem("deltabase-sidebar-collapsed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("status")).toHaveTextContent("expanded");
    expect(localStorage.getItem("deltabase-sidebar-collapsed")).toBe("false");
  });
});
