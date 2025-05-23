'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from "next/font/google";
import "@/ui/globals.css"; 


const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient();

export default function RootLayout({ children }) {
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
    </html>
  );
}