import "../modules/ui/globals.css";

import { ReactNode, Suspense } from "react";
import { SentryProvider } from "@/app/sentry/SentryProvider";
import { IS_PRODUCTION, SENTRY_DSN } from "@/lib/constants";
import { Quicksand } from "next/font/google";
import { MouseCursorProvider } from '@/components/mouse-cursor/provider';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { constructMetadata, constructViewport } from "@/lib/metadata";
import { SessionProvider } from "next-auth/react"
import { cn } from "@/lib/utils";
import LoadingScreen from "@/components/loading-screen";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { ModalProvider } from "@/components/modals/model-provider";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "latin-ext", "vietnamese"],
  preload: true
});


export const metadata = constructMetadata();
export const viewport = constructViewport();

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="cursor-none norm-scrollbar" suppressHydrationWarning>
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
              <ModalProvider>
                <Suspense fallback={<LoadingScreen />}>
                  <MouseCursorProvider />
                  <Toaster />
                  <TooltipProvider>
                    {children}
                  </TooltipProvider>
                </Suspense>
              </ModalProvider>
            </ThemeProvider>
          </SentryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
