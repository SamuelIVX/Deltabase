"use client";
/**
 * Bottom navigation bar for mobile devices (< 768px).
 * Replaces the scrunched-up top sidebar with ergonomic thumb navigation.
 */
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./mobileBottomNav.module.css";
import {
  MdDashboard,
  MdOutlineHelpOutline,
  MdTrendingUp,
  MdCurrencyBitcoin,
  MdCalculate,
} from "react-icons/md";

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const mobileNavItems: NavItem[] = [
  {
    title: "Home",
    path: "/dashboard",
    icon: <MdDashboard size={22} />,
  },
  {
    title: "What-If",
    path: "/dashboard/whatif",
    icon: <MdOutlineHelpOutline size={22} />,
  },
  {
    title: "Stocks",
    path: "/dashboard/stockmarket",
    icon: <MdTrendingUp size={22} />,
  },
  {
    title: "Crypto",
    path: "/dashboard/cryptomarket",
    icon: <MdCurrencyBitcoin size={22} />,
  },
  {
    title: "Tax",
    path: "/dashboard/taxfeecalculator",
    icon: <MdCalculate size={22} />,
  },
];

/**
 * Mobile bottom navigation component providing direct access to primary dashboard routes.
 * @returns {JSX.Element}
 */
export default function MobileBottomNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className={styles.navContainer} aria-label="Mobile navigation">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={styles.iconWrapper}>{item.icon}</span>
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
