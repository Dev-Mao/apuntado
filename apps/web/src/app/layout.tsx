import { Bodoni_Moda, Josefin_Sans } from "next/font/google";

import { AppProviders } from "@/components";
import { ConnectionBanner, RealtimeProvider, RoomNotice } from "@/features/realtime";
import es from "@/messages/es.json";

import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni",
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
  themeColor: "#f5eee6",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>
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
