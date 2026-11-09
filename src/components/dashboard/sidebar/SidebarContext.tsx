"use client";
/**
 * Context and provider managing the collapsible sidebar state.
 * Uses useSyncExternalStore to eliminate cascading renders and hydration mismatches.
 */
import React, { createContext, useContext, useSyncExternalStore, useCallback } from "react";

export interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setIsCollapsed: (collapsed: boolean) => void;
}

const STORAGE_KEY = "deltabase-sidebar-collapsed";
const SIDEBAR_EVENT_NAME = "deltabase-sidebar-change";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_EVENT_NAME, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_EVENT_NAME, callback);
  };
}

let memoryCollapsed: boolean = true;

function getSnapshot(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === null) {
      memoryCollapsed = true;
      return true;
    }
    const parsed = val === "true";
    memoryCollapsed = parsed;
    return parsed;
  } catch {
    return memoryCollapsed;
  }
}

function getServerSnapshot(): boolean {
  return true;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: true,
  toggleSidebar: () => {},
  setIsCollapsed: () => {},
});

/**
 * Provides sidebar collapsed state and persistence helper.
 * @param props - Children to render within the provider.
 * @returns {JSX.Element}
 */
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleSidebar = useCallback(() => {
    const current = getSnapshot();
    const next = !current;
    memoryCollapsed = next;
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Storage unavailable fallback
    }
    window.dispatchEvent(new Event(SIDEBAR_EVENT_NAME));
  }, []);

  const setIsCollapsed = useCallback((collapsed: boolean) => {
    memoryCollapsed = collapsed;
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Storage unavailable fallback
    }
    window.dispatchEvent(new Event(SIDEBAR_EVENT_NAME));
  }, []);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggleSidebar, setIsCollapsed }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Hook to access and toggle the sidebar's collapsed state.
 * @returns {SidebarContextType}
 */
export const useSidebar = () => useContext(SidebarContext);

export default SidebarContext;
