import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Poppins } from "next/font/google";

import { QueryProvider } from "@/components/providers/query-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { SentryClientProvider } from "@/components/providers/sentry-client-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "PayPilot",
  description: "Shopify Payment Analytics & Settlement Reconciliation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <SentryClientProvider>
            <PostHogProvider>
              <QueryProvider>
                <TooltipProvider>
                  {children}
                  <ToastProvider />
                </TooltipProvider>
              </QueryProvider>
            </PostHogProvider>
          </SentryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
