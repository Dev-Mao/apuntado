import { Josefin_Sans, Playfair_Display } from "next/font/google";

import { AppProviders } from "@/components";
import { ConnectionBanner, RealtimeProvider, RoomNotice } from "@/features/realtime";
import es from "@/messages/es.json";

import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

const display = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const sans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-josefin",
  display: "swap",
});

export const metadata: Metadata = {
  title: es.meta.title,
  description: es.meta.description,
};

export const viewport: Viewport = {
  themeColor: "#f3ead9",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="paper-grain">
        <AppProviders>
          <RealtimeProvider>
            <ConnectionBanner />
            {children}
            <RoomNotice />
          </RealtimeProvider>
        </AppProviders>
      </body>
    </html>
  );
}
