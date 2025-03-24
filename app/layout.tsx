import LoginModal from "@/components/LoginModal";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Parts Corner - Inventory Management System",
  description:
    "A comprehensive inventory management system for auto parts and components",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <LoginModal />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
