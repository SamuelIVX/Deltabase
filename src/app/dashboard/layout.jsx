/**
 * Dashboard shell layout — sidebar, market ribbon, navbar, and main content slot.
 */
import Navbar from "@/components/dashboard/navbar/navbar";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import MarketRibbon from "@/components/dashboard/marketribbon/MarketRibbon";
import Footer from "@/components/dashboard/footer/footer";
import styles from "@/components/dashboard/dashboard.module.css";

/**
 * Renders sidebar, market indices ribbon, and navbar around dashboard page content.
 * @param {{ children: import('react').ReactNode }} props
 * @param {import('react').ReactNode} props.children - Nested dashboard route.
 * @returns {JSX.Element} Dashboard chrome layout.
 */
const Layout = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.menu}>
        <Sidebar />
      </div>
      <main className={styles.content}>
        <MarketRibbon />
        <Navbar />
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default Layout;
