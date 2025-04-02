import MenuLink from "./menuLink/menuLink";
import Image from "next/image";
import styles from "./sidebar.module.css";
import { auth } from "@/app/auth";

import {
  FaMoneyBillTransfer,
  CiMoneyCheck1,
  MdOutlineMoney,
  MdDashboard,
  FaQuestion,
  FaCalculator,
  MdOutlineCurrencyExchange,
  MdLogout,
} from "react-icons/md";

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
        title: "WhatIf",
        path: "/dashboard/stocks",
        icon: <FaQuestion />,
      },
      {
        title: "OpportunityCostCalculator",
        path: "/dashboard/crypto",
        icon: <FaCalculator />,
      },
      {
        title: "VolatilitySwings",
        path: "/dashboard/conversion-rates",
        icon: <MdOutlineCurrencyExchange />,
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
        path: "/dashboard/conversion-rates",
        icon: <FaMoneyBillTransfer />,
      },
    ],
  },
];

const Sidebar = async () => {
  const session = await auth();
  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <Image
          className={styles.userImage}
          src="/DeltaBase.png"
          alt=""
          width="50"
          height="50"
        />
        <div className={styles.userDetail}>
          <span className={styles.username}>John Doe</span>
          <span className={styles.userTitle}>User</span>
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

