"use client";

import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";
import { Logo } from "./logo";

export function NavWordmark({
    variant = "full",
    className,
}: {
    variant?: "full" | "symbol";
    isInApp?: boolean;
    className?: string;
}) {

    return (

        <div className="max-w-fit">
            {variant === "full" ? (
                <Wordmark className={className} />
            ) : (
                <Logo
                    className={cn(
                        "h-8 w-8 transition-all duration-75 active:scale-95",
                        className,
                    )}
                />
            )}
        </div>
    );
}