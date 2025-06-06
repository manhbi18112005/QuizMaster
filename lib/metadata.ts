import type { Metadata, Viewport } from "next";

import { WEBAPP_URL } from "@/lib/constants";

const APP_NAME = "QuizMaster";
const APP_DEFAULT_TITLE = "QuizMaster - Student Revision Quizzes";
const APP_TITLE_TEMPLATE = "%s - QuizMaster";
const APP_DESCRIPTION = "QuizMaster is a powerful quiz platform designed to help students revise and master their subjects through interactive quizzes and instant feedback.";

export const metadata: Metadata = {
  metadataBase: new URL(WEBAPP_URL),
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  keywords: ["quiz", "education", "learning", "revision", "students", "interactive", "feedback", "study", "assessment", "knowledge"],
  authors: [{
    name: "No Name Studio",
    url: "https://nnsvn.me"
  }],
  creator: "No Name Studio",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon/ios/16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon/ios/32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icon/ios/180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/icon/ios/192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon/ios/512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  alternates: {
    canonical: "/"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    url: "/",
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    site: "@nn_myt"
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#8b5cf6",
};
