import "../modules/ui/globals.css";

import { ReactNode, Suspense } from "react";
import { SentryProvider } from "@/app/sentry/SentryProvider";
import { IS_PRODUCTION, SENTRY_DSN } from "@/lib/constants";
import { Quicksand } from "next/font/google";
import { MouseCursorProvider } from '@/components/mouse-cursor/provider';
import { Toaster } from "@/components/ui/sonner";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { metadata as appMetadata, viewport as appViewport } from "@/lib/metadata";
import { SessionProvider } from "next-auth/react"
import { cn } from "@/lib/utils";
import LoadingScreen from "@/components/loading-screen";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "latin-ext", "vietnamese"],
  preload: true
});

export const metadata = appMetadata;
export const viewport = appViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="cursor-none" suppressHydrationWarning>
      <head />
      {IS_PRODUCTION && <SpeedInsights sampleRate={0.1} />}
      {IS_PRODUCTION && <Analytics />}
      <body className={cn(
        "antialiased",
        quicksand.variable,
      )} >
        <SessionProvider>
          <SentryProvider sentryDsn={SENTRY_DSN} isEnabled={IS_PRODUCTION}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Suspense fallback={<LoadingScreen />}>
                <MouseCursorProvider />
                <Toaster />
                <TooltipProvider>
                  {children}
                </TooltipProvider>
              </Suspense>
            </ThemeProvider>
          </SentryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
