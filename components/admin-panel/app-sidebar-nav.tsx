"use client";

import { useRouterStuff } from "@/hooks/use-router-stuff";
import { Shield } from "lucide-react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useParams, usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { SidebarNav, SidebarNavAreas } from "./sidebar-nav";
import { WorkspaceDropdown } from "./workspace-dropdown";
import { LayoutDashboardIcon, HelpCircleIcon, Library, BookCheck, NotebookIcon, Lamp, Search } from "lucide-react";
import { BANKPREFIX_URL } from "@/lib/client-constants";
import { Usage } from "./usage";
import { Receipt2 } from "../icons/receipt2";
import InstallPrompter from "../install-prompter";

const NAV_AREAS: SidebarNavAreas<{
  slug: string;
  pathname: string;
  queryString: string;
  session?: Session | null;
  showNews?: boolean;
}> = {
  // Top-level
  default: () => ({
    showSwitcher: false,
    showNews: true,
    direction: "left",
    content: [
      {
        items: [
          {
            name: "Dashboard",
            icon: LayoutDashboardIcon,
            href: `/dashboard`,
            exact: true,
          },
          {
            name: "Search",
            icon: Library,
            href: `/dashboard/search`,
            exact: true,
          },
          {
            name: "Help",
            icon: HelpCircleIcon,
            href: `/`,
            exact: true,
          },
        ],
      },
    ],
  }),


  // Workspace settings
  workspace: ({ slug }) => ({
    showSwitcher: true,
    showNews: true,
    direction: "left",
    content: [
      {
        name: "Questions",
        items: [
          {
            name: "General",
            icon: Library,
            href: `${BANKPREFIX_URL}/${slug}`,
            exact: true,
          },
          {
            name: "Revision",
            icon: BookCheck,
            href: `${BANKPREFIX_URL}/${slug}/revision`,
            exact: true,
          },
          {
            name: "Practice",
            icon: Lamp,
            href: `${BANKPREFIX_URL}/${slug}/practice`,
            exact: true,
          },
          {
            name: "Notes",
            icon: NotebookIcon,
            href: `${BANKPREFIX_URL}/${slug}/notes`,
            exact: true,
          },
          {
            name: "Search",
            icon: Search,
            href: `/dashboard/search`,
            exact: true,
          }
        ],
      },
    ],
  }),

  // Workspace settings
  workspaceSettings: ({ slug }) => ({
    title: "Settings",
    backHref: `${BANKPREFIX_URL}/${slug}`,
    content: [
      {
        name: "Workspace",
        items: [
          {
            name: "General",
            icon: Shield,
            href: `${BANKPREFIX_URL}/${slug}/settings`,
            exact: true,
          },
          {
            name: "Billing",
            icon: Receipt2,
            href: `${BANKPREFIX_URL}/${slug}/settings/billing`,
          },
        ],
      },
    ],
  }),

  userSettings: () => ({
    title: "User Settings",
    backHref: `/dashboard`,
    content: [
      {
        name: "User Settings",
        items: [
          {
            name: "Account",
            icon: Shield,
            href: `/settings/account`,
            exact: true,
          },
          {
            name: "Security",
            icon: Shield,
            href: `/settings/security`,
            exact: true,
          },
        ],
      },
    ],
  }),
};

export function AppSidebarNav({
  toolContent,
  newsContent,
}: {
  toolContent?: ReactNode;
  newsContent?: ReactNode;
}) {
  const { slug } = useParams() as { slug?: string };
  const pathname = usePathname();
  const { getQueryString } = useRouterStuff();
  const { data: session } = useSession();

  const currentArea = useMemo(() => {
    if (pathname.startsWith("/settings")) return "userSettings";

    if (!slug) return "default";

    const basePath = `${BANKPREFIX_URL}/${slug}`;
    if (pathname.startsWith(`${basePath}/settings`)) return "workspaceSettings";
    if (pathname.startsWith(basePath)) return "workspace";

    return "default";
  }, [slug, pathname]);

  return (
    <SidebarNav
      areas={NAV_AREAS}
      currentArea={currentArea}
      data={{
        slug: slug || "",
        pathname,
        queryString: getQueryString(undefined, {
          include: ["folderId", "tagIds"],
        }),
        session: session || undefined,
        showNews: pathname.startsWith(`/${slug}/program`) ? false : true,
      }}
      toolContent={toolContent}
      newsContent={newsContent}
      switcher={<WorkspaceDropdown />}
      bottom={
        <>
          <InstallPrompter />
          <Usage />
        </>
      }
    />
  );
}