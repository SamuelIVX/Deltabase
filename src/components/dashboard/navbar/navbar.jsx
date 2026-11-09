"use client";
/**
 * Dashboard top navbar — route title and search/notification placeholders.
 */
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import {
  MdNotifications,
  MdOutlineChat,
  MdPublic,
  MdSearch,
} from "react-icons/md";

const routeTitles = {
  dashboard: "Dashboard",
  whatif: "What-If Simulator",
  stockmarket: "Stock Market",
  cryptomarket: "Crypto Market",
  taxfeecalculator: "Tax & Fee Calculator",
};

/**
 * Top navbar showing the formatted section title and search placeholder.
 * @returns {JSX.Element}
 */
const Navbar = () => {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean).pop() || "dashboard";
  const title = routeTitles[segment] || (segment.charAt(0).toUpperCase() + segment.slice(1));

  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.menu}>
        <div className={styles.search}>
          <MdSearch aria-hidden="true" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Dashboard search"
            className={styles.input}
          />
        </div>
        <div className={styles.icons}>
          <button type="button" className={styles.iconButton} aria-label="Messages">
            <MdOutlineChat size={20} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Notifications">
            <MdNotifications size={20} />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Global markets">
            <MdPublic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
