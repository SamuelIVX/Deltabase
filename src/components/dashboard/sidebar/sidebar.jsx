import MenuLink from "./menuLink/menuLink";
import Image from "next/image";
import styles from "./sidebar.module.css";

import {
  MdOutlineMoney,
  MdDashboard,
  MdOutlineHelpOutline,
  MdCalculate,
  MdLogout,
  MdOutlineCurrencyExchange,
  MdPayments
} from "react-icons/md";

import { CiMoneyCheck1 } from "react-icons/ci";

const menuItems = [
  {
    title: "Pages",
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
        title: "Calculator",
        path: "/dashboard/opportunitycostcalculator",
        icon: <MdCalculate />,
      },
      {
        title: "Volatility",
        path: "/dashboard/volatilityswings",
        icon: <MdPayments />,
      },
    ],
  },
  {
    title: "Analytics",
    list: [
      {
        title: "Stocks",
        path: "/dashboard/stocks",
        icon: <CiMoneyCheck1 />,
      },
      {
        title: "Crypto",
        path: "/dashboard/crypto",
        icon: <MdOutlineMoney />,
      },
      {
        title: "Conversion Rates",
        path: "/dashboard/conversion_rates",
        icon: <MdOutlineCurrencyExchange />,
      },
    ],
  },
];

const Sidebar = async () => {
  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <Image
          className={styles.userImage}
          src="/DeltaBase.jpg"
          alt=""
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
      <button className={styles.logout}>
        <MdLogout />
        Logout
      </button>
    </div>
  );
};
export default Sidebar;

