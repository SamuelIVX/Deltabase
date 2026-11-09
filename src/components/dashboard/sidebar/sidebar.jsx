/**
 * Dashboard sidebar navigation with menu sections and MenuLink items.
 */
import MenuLink from "./menuLink/menuLink";
import Image from "next/image";
import Link from "next/link";
import styles from "./sidebar.module.css";

import {
  MdDashboard,
  MdOutlineHelpOutline,
  MdTrendingUp,
  MdCalculate,
  MdLogout,
  MdCurrencyBitcoin,
} from "react-icons/md";

const menuItems = [
  {
    title: "User Panels",
    list: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: <MdDashboard />,
      },
      {
        title: "What-If",
        path: "/dashboard/whatif",
        icon: <MdOutlineHelpOutline />,
      },
      {
        title: "Stock Market",
        path: "/dashboard/stockmarket",
        icon: <MdTrendingUp />,
      },
      {
        title: "Crypto Market",
        path: "/dashboard/cryptomarket",
        icon: <MdCurrencyBitcoin />,
      },
      {
        title: "Tax & Fee Calculator",
        path: "/dashboard/taxfeecalculator",
        icon: <MdCalculate />,
      },
    ],
  }
];

/**
 * Sidebar listing dashboard navigation sections.
 * @returns {JSX.Element}
 */
const Sidebar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <Image
          className={styles.userImage}
          src="/DeltaBase.jpg"
          alt="DeltaBase logo"
          width="50"
          height="50"
        />
        <div className={styles.userDetail}>
          <span className={styles.userName}>DeltaBase</span>
          <span className={styles.userTitle}>See the data, not the noise.</span>
        </div>
      </div>
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
      <Link href="/" className={styles.logout} aria-label="Logout">
        <MdLogout />
        Logout
      </Link>
    </div>
  );
};
export default Sidebar;

