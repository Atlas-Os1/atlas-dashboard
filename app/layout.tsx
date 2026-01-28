import type { Metadata } from "next";
import "./globals.css";
import { NavigationV2 } from "@/components/navigation-v2";
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Atlas Live View - Minte Monitoring Dashboard",
  description: "Production-grade monitoring platform for Cloudflare projects with real-time analytics, MCP integrations, and voice control",
  keywords: "cloudflare, monitoring, analytics, dashboard, workers, mcp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased bg-neutral-50 dark:bg-neutral-900 min-h-screen transition-colors duration-300`}>
        <NavigationV2 />
        <main className="pb-20 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
