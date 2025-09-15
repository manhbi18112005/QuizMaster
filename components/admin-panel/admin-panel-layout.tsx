"use client";

import { Footer } from "@/components/admin-panel/footer";

export default function AdminPanelLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main
        className="min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900"
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
