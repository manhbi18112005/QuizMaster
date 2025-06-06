import { LucideIcon } from 'lucide-react';

export type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

export type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
  disabled?: boolean;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
};