import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "Hackathon Tracker",
  description: "Track hackathons you're considering, building, and have finished.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dm.variable} ${bricolage.variable} ${jetbrains.variable} ${caveat.variable}`}>
      <body className="min-h-screen font-sans text-sm">{children}</body>
    </html>
  );
}
