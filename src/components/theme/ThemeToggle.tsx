"use client";

/**
 * Accessible Dark / Light mode toggle button with localStorage persistence.
 * Uses `useSyncExternalStore` to cleanly subscribe to DOM theme attributes without effect cascades.
 */
import { useSyncExternalStore } from "react";
import type { JSX } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import styles from "./ThemeToggle.module.css";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "deltabase-theme";
export const THEME_EVENT_NAME = "deltabase-theme-change";

/**
 * Reads the document's `data-theme` attribute and returns "dark" when missing or invalid.
 * @returns {"dark" | "light"} The active theme.
 */
export function getActiveTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const current = document.documentElement.getAttribute("data-theme");
  if (current === "light" || current === "dark") return current;
  return "dark";
}

/**
 * Applies a theme to document element, dispatches theme event, and persists to localStorage.
 * @param theme - The theme to apply ("dark" | "light").
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Graceful fallback for sandboxed storage environments
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(THEME_EVENT_NAME, { detail: theme }));
  }
}

function subscribeToTheme(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
      document.documentElement.setAttribute("data-theme", e.newValue);
      callback();
    }
  };
  window.addEventListener(THEME_EVENT_NAME, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT_NAME, callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getThemeSnapshot(): Theme {
  return getActiveTheme();
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

/**
 * Interactive icon-only button permitting users to toggle between dark and light themes.
 * @returns The rendered theme toggle button.
 */
export default function ThemeToggle(): JSX.Element {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const handleToggle = (): void => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  };

  const isLight = theme === "light";
  const ariaLabel = isLight ? "Switch to dark theme" : "Switch to light theme";

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={styles.toggleButton}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {isLight ? <MdLightMode size={18} aria-hidden="true" /> : <MdDarkMode size={18} aria-hidden="true" />}
    </button>
  );
}
