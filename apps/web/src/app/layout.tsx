import { Jost, Playfair_Display, Source_Serif_4 } from "next/font/google";

import { AppProviders } from "@/components";
import { ConnectionBanner, RealtimeProvider, RoomNotice } from "@/features/realtime";
import es from "@/messages/es.json";

import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

const display = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-face-display",
  display: "swap",
});

const text = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-face-text",
  display: "swap",
});

const label = Jost({
  subsets: ["latin"],
  variable: "--font-face-label",
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
    <html lang="es" className={`${display.variable} ${text.variable} ${label.variable}`}>
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
