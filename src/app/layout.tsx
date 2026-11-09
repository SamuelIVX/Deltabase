/**
 * Root App Router layout — Inter font, global CSS, and React Query provider.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import "@/components/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeltaBase - See the data, not the noise",
  description: "Dollar-cost-averaging simulator, historical market charts, and tax-adjusted return calculator.",
};

/**
 * Server layout rendering the root HTML document with React Query provider.
 * @param props.children - Nested App Router page content.
 * @returns The root HTML document structure.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
