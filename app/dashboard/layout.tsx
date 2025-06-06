import { ReactNode } from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AdminPanelLayout>{children}</AdminPanelLayout>
  );
}