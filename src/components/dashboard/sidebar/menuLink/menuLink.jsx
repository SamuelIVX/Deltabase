"use client";
/**
 * Active-aware sidebar link item for dashboard navigation.
 */
import Link from "next/link";
import styles from "./menuLink.module.css";
import { usePathname } from "next/navigation";

/**
 * Sidebar link that highlights when the pathname matches `item.path`.
 * @param {{ item: { title: string, path: string, icon: import('react').ReactNode } }} props
 * @returns {JSX.Element}
 * @example
 * <MenuLink item={{ title: 'What-If', path: '/dashboard/whatif', icon: <Icon /> }} />
 */
const MenuLink = ({ item }) => {
  const pathname = usePathname();

  return (
    <Link
      href={item.path}
      className={`${styles.container} ${
        pathname === item.path && styles.active
      }`}
    >
      {item.icon}
      {item.title}
    </Link>
  );
};

export default MenuLink;