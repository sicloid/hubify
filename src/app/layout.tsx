import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SupportChatBot from "@/components/support/SupportChatBot";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hubify",
  description: "Global Trade and Logistics Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // #region agent log
  void fetch("http://127.0.0.1:7728/ingest/1e7e925e-8eab-4e7c-9577-0fba4ad3be84", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "17ebc4",
    },
    body: JSON.stringify({
      sessionId: "17ebc4",
      runId: "dev-startup",
      hypothesisId: "H3",
      location: "src/app/layout.tsx:RootLayout",
      message: "root layout rendered",
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <html lang="tr" className={`${inter.variable} antialiased h-full`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
        <SupportChatBot />
      </body>
    </html>
  );
}
