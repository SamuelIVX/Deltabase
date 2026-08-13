/**
 * Dashboard shell layout — sidebar, navbar, and main content slot.
 */
import Navbar from "@/components/dashboard/navbar/navbar";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
import styles from "@/components/dashboard/dashboard.module.css";
import Footer from "@/components/dashboard/footer/footer";

/**
 * Renders sidebar + navbar around dashboard page content.
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
      <div className={styles.content}>
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
