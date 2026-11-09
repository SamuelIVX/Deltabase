/**
 * Unit tests for ThemeToggle component and helper utilities.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ThemeToggle, {
  getActiveTheme,
  applyTheme,
  THEME_STORAGE_KEY,
} from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to dark theme when no attribute or stored preference is present", () => {
    expect(getActiveTheme()).toBe("dark");
  });

  it("applies theme to document element and persists to localStorage", () => {
    applyTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    applyTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("handles storage write errors gracefully in sandboxed environments", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => applyTheme("light")).not.toThrow();
  });

  it("renders toggle button and toggles between light and dark on click", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", {
      name: /Switch to light theme/i,
    });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(screen.getByText("Light Mode")).toBeDefined();

    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(screen.getByText("Dark Mode")).toBeDefined();
  });

  it("syncs theme when a storage event fires from another tab", () => {
    render(<ThemeToggle />);
    expect(screen.getByText("Dark Mode")).toBeDefined();

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: THEME_STORAGE_KEY,
          newValue: "light",
        })
      );
    });

    expect(screen.getByText("Light Mode")).toBeDefined();
  });
});
