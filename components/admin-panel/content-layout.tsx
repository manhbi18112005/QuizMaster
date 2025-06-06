import { Navbar } from "@/components/admin-panel/navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
  showNavbar?: boolean;
}

export function ContentLayout({ title, children, showNavbar = true }: ContentLayoutProps) {
  return (
    <div>
      {showNavbar && <Navbar title={title} />}
      <div className={`flex flex-col min-h-screen ${showNavbar ? 'p-8' : ''}`}>{children}</div>
    </div>
  );
}
