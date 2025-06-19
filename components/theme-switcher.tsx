"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, DesktopIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/use-translation";

export default function ThemeSwitcher() {
  const { t } = useTranslation();
  const { setTheme, theme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <SunIcon className="w-[1.2rem] h-[1.2rem]" />;
      case "dark":
        return <MoonIcon className="w-[1.2rem] h-[1.2rem]" />;
      case "system":
        return <DesktopIcon className="w-[1.2rem] h-[1.2rem]" />;
      default:
        return <DesktopIcon className="w-[1.2rem] h-[1.2rem]" />;
    }
  };

  const themeOptions = [
    {
      value: "light",
      label: t("settings.theme.light"),
      icon: <SunIcon className="w-4 h-4" />,
    },
    {
      value: "dark",
      label: t("settings.theme.dark"),
      icon: <MoonIcon className="w-4 h-4" />,
    },
    {
      value: "system",
      label: t("settings.theme.system"),
      icon: <DesktopIcon className="w-4 h-4" />,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="rounded-full w-8 h-8 bg-background"
          variant="outline"
          size="icon"
        >
          {getThemeIcon()}
          <span className="sr-only">{t("settings.theme.light")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}