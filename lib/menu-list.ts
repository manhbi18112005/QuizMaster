import {
  LayoutGrid,
  Library,
  Search
} from "lucide-react";

import { getAllQuestionBanks } from "@/lib/db";
import { Group } from "@/types/menu";

export async function getMenuList(pathname: string): Promise<Group[]> {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/",
          label: "Dashboard",
          active: pathname === "/",
          icon: LayoutGrid,
          submenus: []
        },
        {
          href: "/search",
          label: "Search",
          active: pathname === "/search",
          icon: Search,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Question Banks",
      menus: (await getAllQuestionBanks()).map((bank) => ({
        href: `/banks/${bank.id}`,
        label: bank.name,
        active: pathname === `/banks/${bank.id}`,
        icon: Library,
        submenus: []
      })),
    }
  ];
}
