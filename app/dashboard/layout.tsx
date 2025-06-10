import { ReactNode } from "react";
import { AppSidebarNav } from "@/components/admin-panel/app-sidebar-nav";
import { MainNav } from "@/components/admin-panel/main-nav";
import { ModeToggle } from "@/components/mode-toggle";
export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <div className="min-h-screen w-full bg-white">
        <MainNav
          sidebar={AppSidebarNav}
          toolContent={
            <>
              <ModeToggle />
            </>
          }
        >
          {children}
        </MainNav>
      </div>
    </>
  );
}