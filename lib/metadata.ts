import { Metadata } from "next";
const APP_DESCRIPTION = "QuizMaster is a powerful quiz platform designed to help students revise and master their subjects through interactive quizzes and instant feedback.";
const APP_NAME = "QuizMaster";
const APP_DEFAULT_TITLE = "QuizMaster - Student Revision Quizzes";
import { WEBAPP_URL } from "@/lib/constants";

export function constructMetadata({
  title,
  fullTitle,
  description = APP_DESCRIPTION,
  image = "/opengraph-image.png",
  video,
  icons = {
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
  url,
  canonicalUrl,
  noIndex = false,
}: {
  title?: string;
  fullTitle?: string;
  description?: string;
  image?: string | null;
  video?: string | null;
  icons?: Metadata["icons"];
  url?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title:
      fullTitle ||
      (title ? `${title} | ${APP_NAME}` : APP_DEFAULT_TITLE),
    description,
    authors: [{
      name: "No Name Studio",
      url: "https://nnsvn.me"
    }],
    creator: "No Name Studio",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: APP_DEFAULT_TITLE,
    },
    keywords: ["quiz", "education", "learning", "revision", "students", "interactive", "feedback", "study", "assessment", "knowledge"],
    openGraph: {
      title,
      description,
      ...(image && {
        images: image,
      }),
      url,
      ...(video && {
        videos: video,
      }),
    },
    twitter: {
      title,
      description,
      ...(image && {
        card: "summary_large_image",
        images: [image],
      }),
      ...(video && {
        player: video,
      }),
      creator: "@dubdotco",
    },
    icons,

    metadataBase: new URL(WEBAPP_URL),
    applicationName: APP_NAME,
    ...((url || canonicalUrl) && {
      alternates: {
        canonical: url || canonicalUrl,
      },
    }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    manifest: "/manifest.json",
    alternates: {
      canonical: "/"
    },
  };
}



export function constructViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: "#8b5cf6",
  };
};
