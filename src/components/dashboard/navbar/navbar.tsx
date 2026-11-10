"use client";

/**
 * Dashboard top navbar — route title and context subtitle.
 */
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";

interface RouteMeta {
  title: string;
  subtitle: string;
}

const routeMetadata: Record<string, RouteMeta> = {
  dashboard: {
    title: "Market Dashboard",
    subtitle: "Real-time market indices, portfolio overview & financial news",
  },
  whatif: {
    title: "What-If Simulator",
    subtitle: "Historical Dollar-Cost Averaging & opportunity cost backtester",
  },
  stockmarket: {
    title: "Stock Market",
    subtitle: "Live quotes, ETF metrics, valuation, and technical ranges",
  },
  cryptomarket: {
    title: "Crypto Market",
    subtitle: "Real-time cryptocurrency spot rates and historical trends",
  },
  taxfeecalculator: {
    title: "Tax & Fee Calculator",
    subtitle: "Tax-adjusted return projections and drag comparisons",
  },
};

/**
 * Top navbar showing the formatted section title and global theme toggle.
 * @returns {JSX.Element}
 */
const Navbar = () => {
  const pathname = usePathname();
  const currentPath = pathname ?? "/dashboard";
  const segment = currentPath.split("/").filter(Boolean).pop() || "dashboard";
  const meta = routeMetadata[segment] || {
    title: segment.charAt(0).toUpperCase() + segment.slice(1),
    subtitle: "DeltaBase Financial Analytics",
  };

  return (
    <header className={styles.container} aria-label="Dashboard header">
      <div className={styles.titleArea}>
        <h1 className={styles.title}>{meta.title}</h1>
        <p className={styles.subtitle}>{meta.subtitle}</p>
      </div>
    </header>
  );
};

export default Navbar;
