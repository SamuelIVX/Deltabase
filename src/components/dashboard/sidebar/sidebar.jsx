/**
 * Dashboard sidebar navigation with menu sections and MenuLink items.
 */
import MenuLink from "./menuLink/menuLink";
import Image from "next/image";
import styles from "./sidebar.module.css";

import {
  MdDashboard,
  MdOutlineHelpOutline,
  MdTrendingUp,
  MdCalculate,
  MdCurrencyBitcoin,
} from "react-icons/md";

const menuItems = [
  {
    title: "Analytics & Tools",
    list: [
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
    ],
  }
];

/**
 * Sidebar listing dashboard navigation sections and branding.
 * @returns {JSX.Element}
 */
const Sidebar = () => {
  return (
    <aside className={styles.container} aria-label="Sidebar navigation">
      <div>
        <div className={styles.user}>
          <Image
            className={styles.userImage}
            src="/DeltaBase.jpg"
            alt="DeltaBase logo"
            width={44}
            height={44}
            priority
          />
          <div className={styles.userDetail}>
            <span className={styles.userName}>DeltaBase</span>
            <span className={styles.userTitle}>See the data, not the noise.</span>
          </div>
        </div>
        <nav aria-label="Primary navigation">
          <ul className={styles.list}>
            {menuItems.map((cat) => (
              <li key={cat.title}>
                <span className={styles.cat}>{cat.title}</span>
                {cat.list.map((item) => (
                  <MenuLink item={item} key={item.title} />
                ))}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={styles.footerBadge}>
        <span className={styles.statusDot} aria-hidden="true" />
        <span className={styles.footerText}>DeltaBase Analytics • v1.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
