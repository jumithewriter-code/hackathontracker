import type { Metadata, Viewport } from "next";
import { Gochi_Hand, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const gochi = Gochi_Hand({ subsets: ["latin"], weight: "400", variable: "--font-gochi", display: "swap" });

export const metadata: Metadata = {
  title: "Hackathon Tracker",
  description: "Track hackathons you're considering, building, and have finished.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f7ec",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${gochi.variable}`}>
      <body className="min-h-screen font-sans text-sm">{children}</body>
    </html>
  );
}
