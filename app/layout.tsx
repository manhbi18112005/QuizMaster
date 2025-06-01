import type { Metadata } from "next";
import { ReactNode } from "react";
import { Quicksand } from "next/font/google";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "latin-ext", "vietnamese"],
  preload: true
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL
      ? `${process.env.APP_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || 3000}`
  ),
  title: "QuizMaster - Student Revision Quizzes",
  description:
    "QuizMaster is a powerful quiz platform designed to help students revise and master their subjects through interactive quizzes and instant feedback.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    url: "/",
    title: "QuizMaster - Student Revision Quizzes",
    description:
      "QuizMaster helps students revise effectively with interactive quizzes, progress tracking, and instant feedback.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "QuizMaster - Student Revision Quizzes",
    description:
      "QuizMaster is a quiz platform for students to revise and test their knowledge with engaging quizzes."
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable} antialiased`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster />
          <TooltipProvider>
            <AdminPanelLayout>{children}</AdminPanelLayout>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
