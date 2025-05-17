import {
  LayoutGrid,
  Library
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
        }
      ]
    },
    {
      groupLabel: "Question Banks",
      menus: (await getAllQuestionBanks()).map((bank) => ({
        href: `/${bank.id}`,
        label: bank.name,
        active: pathname === `/${bank.id}`,
        icon: Library,
        submenus: []
      })),
    }
  ];
}
