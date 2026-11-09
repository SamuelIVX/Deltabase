"use client";
/**
 * Active-aware sidebar link item supporting both expanded and collapsed modes.
 */
import React from "react";
import Link from "next/link";
import styles from "./menuLink.module.css";
import { usePathname } from "next/navigation";
import { useSidebar } from "../SidebarContext";

export interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface MenuLinkProps {
  item: MenuItem;
}

/**
 * Sidebar link that highlights when the pathname matches `item.path`.
 * Shows title + icon when expanded, and icon only with tooltip when collapsed.
 * @param props - Item data including title, path, and icon.
 * @returns {JSX.Element}
 */
const MenuLink: React.FC<MenuLinkProps> = ({ item }) => {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const isActive = pathname === item.path;

  return (
    <Link
      href={item.path}
      className={`${styles.container} ${isActive ? styles.active : ""} ${
        isCollapsed ? styles.collapsed : ""
      }`}
      aria-label={item.title}
    >
      <span className={styles.iconWrapper}>{item.icon}</span>
      {!isCollapsed && <span className={styles.titleText}>{item.title}</span>}
      {isCollapsed && (
        <span className={styles.floatingTooltip} aria-hidden="true">
          {item.title}
        </span>
      )}
    </Link>
  );
};

export default MenuLink;
