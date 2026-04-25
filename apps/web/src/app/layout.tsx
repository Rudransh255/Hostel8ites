import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import UserProvider from "@/components/UserProvider";
import ToastProvider from "@/components/ToastProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HostelMart — Your Hostel Marketplace",
  description:
    "Buy and sell snacks, groceries, and daily essentials with your hostel neighbours. Fast, simple, and hyperlocal.",
  keywords: ["hostel", "marketplace", "buy", "sell", "students", "snacks"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0062FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[Inter] bg-white">
        <ToastProvider>
          <UserProvider>{children}</UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
