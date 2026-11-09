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

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
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
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
      window.dispatchEvent(new Event(SIDEBAR_EVENT_NAME));
    } catch {
      // Safe fallback
    }
  }, []);

  const setIsCollapsed = useCallback((collapsed: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
      window.dispatchEvent(new Event(SIDEBAR_EVENT_NAME));
    } catch {
      // Safe fallback
    }
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
