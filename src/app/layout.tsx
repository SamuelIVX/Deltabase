'use client';
/**
 * Root App Router layout — Inter font, global CSS, and React Query provider.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from "next/font/google";
import "@/components/globals.css";


const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient();

/**
 * Wraps all routes with QueryClientProvider and the root HTML shell.
 * @param children - Nested App Router page content.
 * @returns The root HTML document structure.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <head>
        <title>Deltabase</title>
      </head>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html >
  );
}