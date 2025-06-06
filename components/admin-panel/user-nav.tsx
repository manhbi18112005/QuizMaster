"use client";

import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link";
import { LayoutGrid, LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const MENU_ITEMS = [
  {
    label: "Your Banks",
    href: "/dashboard",
    icon: LayoutGrid
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings
  }
] as const;

const DEFAULT_AVATAR = "/avt.png";

export function UserNav() {
  const { data: session } = useSession();

  const getUserInitials = (name?: string | null) =>
    name?.charAt(0).toUpperCase() || "U";

  const getUserAvatar = (image?: string | null) =>
    image || DEFAULT_AVATAR;

  if (!session) {
    return (
      <Button onClick={() => signIn()} variant="outline"
        className="relative h-8 rounded-full">
        Sign In
      </Button>
    );
  }

  const { user } = session;

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getUserAvatar(user?.image)} alt="Avatar" />
                  <AvatarFallback className="bg-transparent">
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-60 p-1" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getUserAvatar(user?.image)} alt="Avatar" />
              <AvatarFallback className="bg-transparent">
                {getUserInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || "No email"}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="p-1">
          {MENU_ITEMS.map((item) => (
            <DropdownMenuItem key={item.href} className="hover:cursor-pointer p-3 rounded-md text-sm" asChild>
              <Link href={item.href} className="flex items-center justify-between">
                {item.label}
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer p-3 rounded-md m-1 text-sm flex items-center justify-between"
          onClick={() => signOut()}
        >
          Sign out
          <LogOut className="w-5 h-5 text-muted-foreground" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
