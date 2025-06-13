import { MaxWidthWrapper } from "../ui/max-width-wrapper";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PropsWithChildren, ReactNode } from "react";
import { UserNav } from "./user-nav";
import { NavButton } from "./nav-button";
import { ModeToggle } from "../mode-toggle";

export function ContentLayout({
  title,
  titleBackButtonLink,
  titleControls,
  description,
  className,
  contentWrapperClassName,
  children,
}: PropsWithChildren<{
  title?: ReactNode;
  titleBackButtonLink?: string;
  titleControls?: ReactNode;
  description?: ReactNode;
  hideReferButton?: boolean;
  className?: string;
  contentWrapperClassName?: string;
}>) {
  const hasTitle = title !== undefined;
  const hasDescription = description !== undefined;

  return (
    <div
      className={cn(
        "mt-3 bg-sidebar md:bg-background",
        (hasTitle || hasDescription) && "md:mt-6 md:py-3",
        className,
      )}
    >
      <MaxWidthWrapper>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <NavButton />
            {(hasTitle || hasDescription) && (
              <div>
                {hasTitle && (
                  <div className="flex items-center gap-2">
                    {titleBackButtonLink && (
                      <Link
                        href={titleBackButtonLink}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <ChevronLeft className="size-5" />
                      </Link>
                    )}
                    <h1 className="text-xl font-semibold leading-7 text-foreground md:text-2xl">
                      {title}
                    </h1>
                  </div>
                )}
                {hasDescription && (
                  <p className="mt-1 hidden text-base text-muted-foreground md:block">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>
          {titleControls && (
            <div className="hidden md:block">{titleControls}</div>
          )}
          <div className="flex items-center gap-4 md:hidden">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </MaxWidthWrapper>
      <div
        className={cn(
          "bg-background pt-2.5 max-md:mt-3 max-md:rounded-t-[16px]",
          contentWrapperClassName,
        )}
      >
        {hasDescription && (
          <MaxWidthWrapper>
            <p className="mb-3 mt-1 text-base text-muted-foreground md:hidden">
              {description}
            </p>
          </MaxWidthWrapper>
        )}
        {children}
      </div>
    </div>
  );
}