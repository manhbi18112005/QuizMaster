import {
  LayoutGrid,
  Library,
  Search,
  Shield,
  Bell,
  Palette,
  Key,
  Globe
} from "lucide-react";

import { getAllQuestionBanks } from "@/lib/db";
import { Group } from "@/types/menu";

function isActive(pathname: string, href: string): boolean {
  return pathname === href;
}

export const settingsNavItems = [
  {
    title: "Account",
    href: "/settings/account",
    icon: Shield,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
    icon: Palette,
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: Key,
  },
  {
    title: "Privacy",
    href: "/settings/privacy",
    icon: Globe,
  },
];

export async function getMenuList(pathname: string): Promise<Group[]> {
  const questionBanks = await getAllQuestionBanks();

  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: isActive(pathname, "/dashboard"),
          icon: LayoutGrid,
          submenus: []
        },
        {
          href: "/dashboard/search",
          label: "Search",
          active: isActive(pathname, "/dashboard/search"),
          icon: Search,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Question Banks",
      menus: questionBanks.length > 0 
        ? questionBanks.map((bank) => {
            const href = `/dashboard/banks/${bank.id}`;
            return {
              href,
              label: bank.name,
              active: isActive(pathname, href),
              icon: Library,
              submenus: []
            };
          })
        : [
            {
              href: "#",
              label: "No Question Banks",
              active: false,
              icon: Library,
              submenus: [],
              disabled: true
            }
          ]
    }
  ];
}
