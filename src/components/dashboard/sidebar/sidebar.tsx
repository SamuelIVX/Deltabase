"use client";
/**
 * Dashboard sidebar navigation supporting collapsible mode, branding, and direct nav links.
 */
import React from "react";
import Link from "next/link";
import Image from "next/image";
import MenuLink, { MenuItem } from "./menuLink/menuLink";
import styles from "./sidebar.module.css";
import { useSidebar } from "./SidebarContext";
import ThemeToggle from "@/components/theme/ThemeToggle";

import {
  MdDashboard,
  MdOutlineHelpOutline,
  MdTrendingUp,
  MdCalculate,
  MdCurrencyBitcoin,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

const navItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <MdDashboard size={18} />,
  },
  {
    title: "What-If Simulator",
    path: "/dashboard/whatif",
    icon: <MdOutlineHelpOutline size={18} />,
  },
  {
    title: "Stock Market",
    path: "/dashboard/stockmarket",
    icon: <MdTrendingUp size={18} />,
  },
  {
    title: "Crypto Market",
    path: "/dashboard/cryptomarket",
    icon: <MdCurrencyBitcoin size={18} />,
  },
  {
    title: "Tax & Fee Calculator",
    path: "/dashboard/taxfeecalculator",
    icon: <MdCalculate size={18} />,
  },
];

/**
 * Sidebar listing dashboard navigation links with collapsible toggle.
 * @returns {JSX.Element}
 */
const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={isCollapsed ? styles.containerCollapsed : styles.container}
      aria-label="Sidebar navigation"
    >
      <div>
        <div className={isCollapsed ? styles.headerRowCollapsed : styles.headerRow}>
          <Link
            href="/dashboard"
            className={isCollapsed ? styles.userCollapsed : styles.user}
            title="DeltaBase"
            aria-label="DeltaBase Home"
          >
            <Image
              className={styles.userImage}
              src="/icon.png"
              alt="DeltaBase logo"
              width={36}
              height={36}
              priority
            />
            {!isCollapsed && (
              <div className={styles.userDetail}>
                <span className={styles.userName}>DeltaBase</span>
                <span className={styles.userTitle}>See the data, not the noise.</span>
              </div>
            )}
          </Link>
        </div>

        <nav aria-label="Primary navigation">
          <ul className={isCollapsed ? styles.listCollapsed : styles.list}>
            {navItems.map((item) => (
              <li key={item.title}>
                <MenuLink item={item} />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <button
        type="button"
        className={styles.toggleButtonMiddle}
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <MdChevronRight size={16} /> : <MdChevronLeft size={16} />}
      </button>

      <div className={isCollapsed ? styles.footerSectionCollapsed : styles.footerSection}>
        <div className={isCollapsed ? styles.themeToggleRowCollapsed : styles.themeToggleRow}>
          <ThemeToggle />
          {!isCollapsed && <span className={styles.themeToggleLabel}>Appearance</span>}
        </div>

        <div
          className={isCollapsed ? styles.footerBadgeCollapsed : styles.footerBadge}
          title={isCollapsed ? "DeltaBase Analytics • v1.0" : undefined}
        >
          <span className={styles.statusDot} aria-hidden="true" />
          {!isCollapsed && (
            <span className={styles.footerText}>DeltaBase Analytics • v1.0</span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
