"use client";

/**
 * Dashboard top navbar — route title, global theme toggle, and repository link.
 */
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { FaGithub } from "react-icons/fa";

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
    title: "Stock Market Intelligence",
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
 * Top navbar showing the formatted section title, global theme toggle, and repo actions.
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

      <div className={styles.actions}>
        <ThemeToggle />
        <a
          href="https://github.com/SamuelIVX/Deltabase"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.iconLink}
          aria-label="View DeltaBase repository on GitHub"
          title="GitHub Repository"
        >
          <FaGithub size={18} aria-hidden="true" />
        </a>
      </div>
    </header>
  );
};

export default Navbar;
