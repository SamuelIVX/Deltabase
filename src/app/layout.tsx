/**
 * Root App Router layout — Inter font, global CSS, theme initialization script, and React Query provider.
 */
import type { Metadata } from "next";
import type { JSX } from "react";
import { Inter } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import "@/components/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeltaBase - See the data, not the noise",
  description: "Dollar-cost-averaging simulator, historical market charts, and tax-adjusted return calculator.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('deltabase-theme');
    var theme = (stored === 'light' || stored === 'dark') ? stored : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

/**
 * Server layout rendering the root HTML document with React Query provider and theme bootstrap.
 * @param props.children - Nested App Router page content.
 * @returns The root HTML document structure.
 */
export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
