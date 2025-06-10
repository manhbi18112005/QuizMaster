import { NavWordmark } from "../ui/nav-wordmark";
import { Icon } from "@/types/icon";
import { AnimatedSizeContainer } from "../ui/animated-size-container";
import { ClientOnly } from "../ui/client-only";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PropsWithChildren,
  ReactNode,
  Suspense,
  useMemo,
  useState,
} from "react";

import { UserNav } from "@/components/admin-panel/user-nav";

export type NavItemCommon = {
  name: string;
  href: string;
  exact?: boolean;
};

export type NavSubItemType = NavItemCommon;

export type NavItemType = NavItemCommon & {
  icon: Icon;
  items?: NavSubItemType[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SidebarNavAreas<T extends Record<any, any>> = Record<
  string,
  (args: T) => {
    title?: string;
    backHref?: string;
    showSwitcher?: boolean;
    showNews?: boolean;
    direction?: "left" | "right";
    content: {
      name?: string;
      items: NavItemType[];
    }[];
  }
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SidebarNav<T extends Record<any, any>>({
  areas,
  currentArea,
  data,
  toolContent,
  newsContent,
  switcher,
  bottom,
}: {
  areas: SidebarNavAreas<T>;
  currentArea: string;
  data: T;
  toolContent?: ReactNode;
  newsContent?: ReactNode;
  switcher?: ReactNode;
  bottom?: ReactNode;
}) {
  return (
    <ClientOnly className="scrollbar-hide relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden">
      <nav className="relative flex grow flex-col p-3 text-muted-foreground">
        <div className="relative flex items-start justify-between gap-1 pb-3">
          {Object.entries(areas).map(([area, areaConfig]) => {
            const { title, backHref } = areaConfig(data);

            return (
              <Link
                key={area}
                href={backHref ?? "/"}
                className={cn(
                  "rounded-md px-1 outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring",
                  area === currentArea
                    ? "relative opacity-100"
                    : "pointer-events-none absolute opacity-0",
                  (!title || !backHref) && "mb-1",
                )}
                aria-hidden={area !== currentArea ? true : undefined}
                inert={area !== currentArea ? true : undefined}
              >
                {title && backHref ? (
                  <div className="py group -my-1 -ml-1 flex items-center gap-2 py-2 pr-1 text-sm font-medium text-foreground">
                    <ChevronLeft className="size-4 text-muted-foreground transition-transform duration-100 group-hover:-translate-x-0.5" />
                    {title}
                  </div>
                ) : (
                  <NavWordmark className="h-6" isInApp />
                )}
              </Link>
            );
          })}
          <div className="hidden items-center gap-3 md:flex">
            <Suspense fallback={null}>{toolContent}</Suspense>
            <UserNav />
          </div>
        </div>
        <div className="relative w-full grow">
          {Object.entries(areas).map(([area, areaConfig]) => {
            const { content, showSwitcher, showNews, direction } =
              areaConfig(data);
            return (
              <Area
                key={area}
                visible={area === currentArea}
                direction={direction ?? "right"}
              >
                {showSwitcher && switcher && (
                  <div className="pt-2">{switcher}</div>
                )}

                <div className="flex flex-col gap-4 pt-4">
                  {content.map(({ name, items }, idx) => (
                    <div key={idx} className="flex flex-col gap-0.5">
                      {name && (
                        <div className="mb-2 pl-1 text-sm text-muted-foreground">
                          {name}
                        </div>
                      )}
                      {items.map((item) => (
                        <NavItem key={item.name} item={item} />
                      ))}
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {showNews && (
                    <motion.div
                      className="-mx-3 flex grow flex-col justify-end"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{
                        duration: 0.1,
                        ease: "easeInOut",
                      }}
                    >
                      {newsContent}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Area>
            );
          })}
        </div>
      </nav>
      {bottom && (
        <div className="relative flex flex-col justify-end">{bottom}</div>
      )}
    </ClientOnly>
  );
}

function NavItem({ item }: { item: NavItemType | NavSubItemType }) {
  const { name, href, exact } = item;

  const Icon = "icon" in item ? item.icon : undefined;
  const items = "items" in item ? item.items : undefined;

  const [hovered, setHovered] = useState(false);

  const pathname = usePathname();

  const isActive = useMemo(() => {
    const hrefWithoutQuery = href.split("?")[0];
    return exact
      ? pathname === hrefWithoutQuery
      : pathname.startsWith(hrefWithoutQuery);
  }, [pathname, href, exact]);

  return (
    <div>
      <Link
        href={href}
        data-active={isActive}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className={cn(
          "group flex items-center gap-2.5 rounded-md p-2 text-sm leading-none text-muted-foreground transition-[background-color,color,font-weight] duration-75 hover:bg-accent/50 active:bg-accent/80",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive &&
            !items &&
            "bg-primary/10 font-medium text-primary hover:bg-primary/20 active:bg-primary/15",
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "size-4 text-muted-foreground transition-colors duration-75",
              !items && "group-data-[active=true]:text-primary",
            )}
            data-hovered={hovered}
          />
        )}
        {name}
        {items && (
          <div className="flex grow justify-end">
            {items ? (
              <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-75 group-data-[active=true]:rotate-180" />
            ) : null}
          </div>
        )}
      </Link>
      {items && (
        <AnimatedSizeContainer
          height
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <div
            className={cn(
              "transition-opacity duration-200",
              isActive ? "h-auto" : "h-0 opacity-0",
            )}
            aria-hidden={!isActive}
          >
            <div className="pl-px pt-1">
              <div className="pl-3.5">
                <div className="flex flex-col gap-0.5 border-l border-border pl-2">
                  {items.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSizeContainer>
      )}
    </div>
  );
}

export function Area({
  visible,
  direction,
  children,
}: PropsWithChildren<{ visible: boolean; direction: "left" | "right" }>) {
  return (
    <div
      className={cn(
        "left-0 top-0 flex size-full flex-col transition-[opacity,transform] duration-300",
        visible
          ? "opacity-100 relative z-10"
          : cn(
              "pointer-events-none absolute opacity-0 z-0",
              direction === "left" ? "-translate-x-full" : "translate-x-full",
            ),
      )}
      aria-hidden={!visible ? "true" : undefined}
      inert={!visible ? true : undefined}
    >
      {children}
    </div>
  );
}