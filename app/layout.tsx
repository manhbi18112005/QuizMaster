import "../modules/ui/globals.css";

import { ReactNode } from "react";
import { Quicksand } from "next/font/google";
import { constructMetadata, constructViewport } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import RootProviders from "./providers";
import { SentryProvider } from "@/app/sentry/SentryProvider";
import { IS_PRODUCTION, SENTRY_DSN } from "@/lib/constants";

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

        <SentryProvider sentryDsn={SENTRY_DSN} isEnabled={IS_PRODUCTION}>
          <RootProviders>{children}</RootProviders>
        </SentryProvider>
      </body>
    </html>
  );
}
