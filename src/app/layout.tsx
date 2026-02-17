// ============================================
// ROOT LAYOUT
// File: src/app/layout.tsx
// ============================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LV Panel Quotation System | Power Projects Limited",
  description: "Professional quotation management system for LV Panel projects",
  keywords: ["quotation", "LV panel", "electrical", "power projects"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
