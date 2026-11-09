"use client";
/**
 * Dashboard shell layout — collapsible sidebar, market ribbon, navbar, and main content slot.
 */
import React from "react";
import Navbar from "@/components/dashboard/navbar/navbar";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import MarketRibbon from "@/components/dashboard/marketribbon/MarketRibbon";
import Footer from "@/components/dashboard/footer/footer";
import styles from "@/components/dashboard/dashboard.module.css";
import { SidebarProvider, useSidebar } from "@/components/dashboard/sidebar/SidebarContext";

interface LayoutProps {
  children: React.ReactNode;
}

const DashboardShell: React.FC<LayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className={styles.container}>
      <div className={`${styles.menu} ${isCollapsed ? styles.menuCollapsed : ""}`}>
        <Sidebar />
      </div>
      <main className={styles.content}>
        <MarketRibbon />
        <Navbar />
        {children}
        <Footer />
      </main>
    </div>
  );
};

/**
 * Dashboard root layout providing sidebar state and shell chrome.
 * @param props - Nested route children.
 * @returns {JSX.Element}
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <DashboardShell>{children}</DashboardShell>
    </SidebarProvider>
  );
};

export default Layout;
