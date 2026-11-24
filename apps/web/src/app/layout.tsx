import { Gloock, Nunito } from "next/font/google";

import { AppProviders } from "@/components";
import { AccountProvider } from "@/features/account";
import { ConnectionBanner, RealtimeProvider, RoomNotice } from "@/features/realtime";
import es from "@/messages/es.json";

import "./globals.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

const display = Gloock({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-face-display",
  display: "swap",
});

const text = Nunito({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-face-text",
  display: "swap",
});

export const metadata: Metadata = {
  title: es.meta.title,
  description: es.meta.description,
};

export const viewport: Viewport = {
  themeColor: "#f6eee3",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${text.variable}`}>
      <body>
        <AppProviders>
          <RealtimeProvider>
            <AccountProvider>
              <ConnectionBanner />
              {children}
              <RoomNotice />
            </AccountProvider>
          </RealtimeProvider>
        </AppProviders>
      </body>
    </html>
  );
}
