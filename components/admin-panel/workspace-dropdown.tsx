"use client";

import { ModalContext } from "../modals/model-provider";
import useWorkspaces from "@/helpers/swr/use-workspaces";
import { QuestionBank } from "@/types/quiz";
import { PlanProps } from "@/types/plan";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAvatarUrl, OG_AVATAR_URL } from "@/lib/utils/avatar";
import { BlurImage } from "../ui/blur-image";
import { Check2 } from "../icons/check2";
import { Gear } from "../icons/gear";
import { Plus } from "../icons/plus";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BANKPREFIX_URL } from "@/lib/client-constants";

export function WorkspaceDropdown() {
  const { workspaces, loading } = useWorkspaces();

  const { data: session, status } = useSession();
  const { slug: currentSlug, key } = useParams() as {
    slug?: string;
    key?: string;
  };

  // Prevent slug from changing to empty to avoid UI switching during nav animation
  const [slug, setSlug] = useState(currentSlug);
  useEffect(() => {
    if (currentSlug) setSlug(currentSlug);
  }, [currentSlug]);

  const selected = useMemo(() => {
    const selectedWorkspace = workspaces?.find(
      (workspace) => workspace.id === slug,
    );

    if (slug && workspaces && selectedWorkspace) {
      return {
        ...selectedWorkspace,
        image:
          selectedWorkspace.logo || OG_AVATAR_URL,
        slug: selectedWorkspace.id,
        plan: "enterprise" as PlanProps,
      };

      // return personal account selector if there's no workspace or error (user doesn't have access to workspace)
    } else {
      return {
        name: session?.user?.name || session?.user?.email,
        id: session?.user?.id,
        slug: "/",
        image: getAvatarUrl(session?.user),
        plan: "enterprise" as PlanProps,
      };
    }
  }, [slug, workspaces, session]) as {
    id?: string;
    name: string;
    slug: string;
    image: string;
    plan: PlanProps;
  };

  const [openPopover, setOpenPopover] = useState(false);

  if (!workspaces || status === "loading" || loading) {
    return <WorkspaceDropdownPlaceholder />;
  }

  return (
    <div>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-between rounded-lg p-1.5 text-left text-sm transition-all duration-75 hover:bg-accent/50 active:bg-accent/80 data-[state=open]:bg-accent/80",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <div className="flex min-w-0 items-center gap-x-2.5 pr-2">
              <BlurImage
                src={selected.image}
                referrerPolicy="no-referrer"
                width={28}
                height={28}
                alt={selected.id || selected.name}
                className="h-7 w-7 flex-none shrink-0 overflow-hidden rounded-full"
              />
              <div className={cn(key ? "hidden" : "block", "min-w-0 sm:block")}>
                <div className="truncate text-sm font-medium leading-5 text-foreground">
                  {selected.name}
                </div>
                {selected.slug !== "/" && (
                  <div
                    className={cn(
                      "truncate text-xs capitalize leading-tight",
                      getPlanColor(selected.plan),
                    )}
                  >
                    {selected.plan}
                  </div>
                )}
              </div>
            </div>
            <ChevronsUpDown
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <WorkspaceList
            selected={selected}
            workspaces={workspaces}
            setOpenPopover={setOpenPopover}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function WorkspaceDropdownPlaceholder() {
  return (
    <div className="flex w-full animate-pulse items-center gap-x-1.5 rounded-lg p-1.5">
      <div className="size-7 animate-pulse rounded-full bg-muted" />
      <div className="mb-px mt-0.5 h-8 w-28 grow animate-pulse rounded-md bg-muted" />
      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

function WorkspaceList({
  selected,
  workspaces,
  setOpenPopover,
}: {
  selected: {
    name: string;
    slug: string;
    image: string;
    plan: PlanProps;
  };
  workspaces: QuestionBank[];
  setOpenPopover: (open: boolean) => void;
}) {
  const { setShowAddWorkspaceModal } = useContext(ModalContext);
  const pathname = usePathname();

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollProgress, updateScrollProgress } = useScrollProgress(scrollRef);

  const href = useCallback(
    (newSlug: string) => {
      // Extract the path after the current workspace slug and preserve it
      const currentWorkspacePattern = `${BANKPREFIX_URL}/${selected.slug}`;
      const remainingPath = pathname.replace(currentWorkspacePattern, '');
      return `${BANKPREFIX_URL}/${newSlug}${remainingPath}`;
    },
    [pathname, selected.slug],
  );

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        onScroll={updateScrollProgress}
        className="relative max-h-80 w-full space-y-0.5 overflow-auto rounded-lg bg-popover text-base sm:w-64 sm:text-sm"
      >
        {/* Current workspace section */}
        <div className="border-b border-border p-2">
          <div className="flex items-center gap-x-2.5 rounded-md p-2">
            <BlurImage
              src={selected.image || OG_AVATAR_URL}
              width={28}
              height={28}
              alt={selected.name}
              className="size-8 shrink-0 overflow-hidden rounded-full"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium leading-5 text-foreground">
                {selected.name}
              </div>
              {selected.slug !== "/" && (
                <div
                  className={cn(
                    "truncate text-xs capitalize leading-tight",
                    getPlanColor(selected.plan),
                  )}
                >
                  {selected.plan}
                </div>
              )}
            </div>
          </div>

          {/* Settings and Invite members options */}
          <div className="mt-2 flex flex-col gap-0.5">
            <Link
              href={`${BANKPREFIX_URL}/${selected.slug}/settings`}
              className="flex w-full items-center gap-x-2 rounded-md px-2 py-1.5 text-foreground outline-none transition-all duration-75 hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring active:bg-accent/80"
              onClick={() => setOpenPopover(false)}
            >
              <Gear className="size-4 text-muted-foreground" />
              <span className="block truncate text-sm">Settings</span>
            </Link>
          </div>
        </div>

        {/* Workspaces section */}
        <div className="p-2">
          <p className="p-1 text-xs font-medium text-muted-foreground">Workspaces</p>
          <div className="flex flex-col gap-0.5">
            {workspaces.map(({ id, name, logo }) => {
              const isActive = selected.slug === id;
              return (
                <Link
                  key={id}
                  className={cn(
                    "relative flex w-full items-center gap-x-2 rounded-md px-2 py-1.5 transition-all duration-75",
                    "hover:bg-accent/50 active:bg-accent/80",
                    "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive && "bg-accent/50",
                  )}
                  href={href(id)}
                  shallow={false}
                  onClick={() => setOpenPopover(false)}
                >
                  <BlurImage
                    src={logo || OG_AVATAR_URL}
                    width={28}
                    height={28}
                    alt={id}
                    className="size-6 shrink-0 overflow-hidden rounded-full"
                  />
                  <span className="block truncate text-sm leading-5 text-foreground sm:max-w-[140px]">
                    {name}
                  </span>
                  {selected.slug === id ? (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground">
                      <Check2 className="size-4" aria-hidden="true" />
                    </span>
                  ) : null}
                </Link>
              );
            })}
            <button
              key="add"
              onClick={() => {
                setOpenPopover(false);
                setShowAddWorkspaceModal(true);
              }}
              className="group flex w-full cursor-pointer items-center gap-x-2 rounded-md p-2 text-foreground transition-all duration-75 hover:bg-accent/50 active:bg-accent/80"
            >
              <Plus className="ml-1.5 size-4 text-muted-foreground" />
              <span className="block truncate">Create new workspace</span>
            </button>
          </div>
        </div>
      </div>
      {/* Bottom scroll fade */}
      <div
        className="pointer-events-none absolute -bottom-px left-0 h-16 w-full rounded-b-lg bg-gradient-to-t from-popover sm:bottom-0"
        style={{ opacity: 1 - Math.pow(scrollProgress, 2) }}
      />
    </div>
  );
}

const getPlanColor = (plan: string) =>
  !plan
    ? "text-muted-foreground"
    : plan === "enterprise"
      ? "text-purple-600 dark:text-purple-400"
      : plan === "advanced"
        ? "text-amber-600 dark:text-amber-400"
        : plan.startsWith("business")
          ? "text-blue-600 dark:text-blue-400"
          : plan === "pro"
            ? "text-cyan-600 dark:text-cyan-400"
            : "text-muted-foreground";