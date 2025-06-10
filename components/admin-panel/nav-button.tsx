"use client";

import { Button } from "../ui/button";
import { useContext } from "react";
import { SideNavContext } from "./main-nav";
import { LayoutDashboardIcon } from "lucide-react";

export function NavButton() {
  const { setIsOpen } = useContext(SideNavContext);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => setIsOpen((o) => !o)}
      icon={<LayoutDashboardIcon className="size-4" />}
      className="h-auto w-fit p-1 md:hidden"
    />
  );
}