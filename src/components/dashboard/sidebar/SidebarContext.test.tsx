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

  it("defaults to collapsed state when no preference is saved", () => {
    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("collapsed");
  });

  it("reads stored expanded preference from localStorage on mount", () => {
    localStorage.setItem("deltabase-sidebar-collapsed", "false");

    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("expanded");
  });

  it("toggles state and writes to localStorage when toggleSidebar is called", () => {
    render(
      <SidebarProvider>
        <TestConsumer />
      </SidebarProvider>
    );

    expect(screen.getByTestId("status")).toHaveTextContent("collapsed");

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("status")).toHaveTextContent("expanded");
    expect(localStorage.getItem("deltabase-sidebar-collapsed")).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByTestId("status")).toHaveTextContent("collapsed");
    expect(localStorage.getItem("deltabase-sidebar-collapsed")).toBe("true");
  });

  it("maintains in-memory state and allows toggling when localStorage throws", () => {
    const originalGetItem = localStorage.getItem;
    const originalSetItem = localStorage.setItem;

    localStorage.getItem = () => {
      throw new Error("SecurityError: Access is denied");
    };
    localStorage.setItem = () => {
      throw new Error("SecurityError: Access is denied");
    };

    try {
      render(
        <SidebarProvider>
          <TestConsumer />
        </SidebarProvider>
      );

      // Defaults to collapsed fallback
      expect(screen.getByTestId("status")).toHaveTextContent("collapsed");

      // Toggling should flip in-memory state to expanded
      fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
      expect(screen.getByTestId("status")).toHaveTextContent("expanded");

      // Toggling again should flip back to collapsed
      fireEvent.click(screen.getByRole("button", { name: "Toggle" }));
      expect(screen.getByTestId("status")).toHaveTextContent("collapsed");
    } finally {
      localStorage.getItem = originalGetItem;
      localStorage.setItem = originalSetItem;
    }
  });
});
