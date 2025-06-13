/* eslint-disable react/display-name */
"use client";

import useWorkspace from "@/helpers/swr/use-workspace";
import { AnimatedSizeContainer } from "../ui/animated-size-container";
import { buttonVariants } from "../ui/button";
import { CursorRays } from "../icons/cursor-rays";
import { Hyperlink } from "../icons/hyperlink";
import { cn } from "@/lib/utils";
import { nFormatter } from "@/helpers/nFormatter";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CSSProperties, forwardRef, useMemo, useState } from "react";
import { BANKPREFIX_URL } from "@/lib/client-constants";
const INFINITY_NUMBER = 1000000000;

export function Usage() {
    const { slug } = useParams() as { slug?: string };

    return slug ? <UsageInner /> : null;
}

function UsageInner() {
    const {
        usage,
        usageLimit,
        itemsUsage,
        itemsLimit,
        plan,
        slug,
        loading,
    } = useWorkspace({ swrOpts: { keepPreviousData: true } });

    const [hovered, setHovered] = useState(false);

    // Warn the user if they're >= 90% of any limit
    const warnings = useMemo(
        () =>
            [
                [usage, usageLimit],
                [itemsUsage, itemsLimit],
            ].map(
                ([usage, limit]) =>
                    usage !== undefined &&
                    limit !== undefined &&
                    usage / Math.max(0, usage, limit) >= 0.9,
            ),
        [usage, usageLimit, itemsUsage, itemsLimit],
    );

    return loading || usage !== undefined ? (
        <>
            <AnimatedSizeContainer height>
                <div className="border-t border-neutral-300/80 p-3 dark:border-neutral-700/80">
                    <Link
                        className="group flex items-center gap-0.5 text-sm font-normal text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                        href={`${BANKPREFIX_URL}/${slug}/settings/billing`}
                    >
                        Usage
                        <ChevronRight className="size-3 text-neutral-400 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-neutral-500 dark:text-neutral-500 dark:group-hover:text-neutral-400" />
                    </Link>

                    <div className="mt-4 flex flex-col gap-4">
                        <UsageRow
                            icon={CursorRays}
                            label="Usage"
                            usage={usage}
                            limit={usageLimit}
                            showNextPlan={hovered}
                            nextPlanLimit={usageLimit}
                            warning={warnings[0]}
                        />
                        <UsageRow
                            icon={Hyperlink}
                            label="Questions"
                            usage={itemsUsage}
                            limit={itemsLimit}
                            showNextPlan={hovered}
                            nextPlanLimit={itemsLimit}
                            warning={warnings[1]}
                        />
                    </div>

                    <Link
                        href={`${BANKPREFIX_URL}/${slug}/settings/upgrade`}
                        className={cn(
                            buttonVariants(),
                            "mt-4 flex h-9 items-center justify-center rounded-md border px-4 text-sm",
                        )}
                        onMouseEnter={() => {
                            setHovered(true);
                        }}
                        onMouseLeave={() => {
                            setHovered(false);
                        }}
                    >
                        {plan === "free" ? "Get Pro Unlimited" : "Upgrade plan"}
                    </Link>
                </div>
            </AnimatedSizeContainer>
        </>
    ) : null;
}

type UsageRowProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string;
    usage?: number;
    limit?: number;
    showNextPlan: boolean;
    nextPlanLimit?: number;
    warning: boolean;
};

const UsageRow = forwardRef<HTMLDivElement, UsageRowProps>(
    (
        {
            icon: Icon,
            label,
            usage,
            limit,
            showNextPlan,
            nextPlanLimit,
            warning,
        }: UsageRowProps,
        ref,
    ) => {
        const loading = usage === undefined || limit === undefined;
        const unlimited = limit !== undefined && limit >= INFINITY_NUMBER;

        return (
            <div ref={ref}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Icon className="size-3.5 text-neutral-600 dark:text-neutral-400" />
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            {label}
                        </span>
                    </div>
                    {!loading ? (
                        <div className="flex items-center">
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                <NumberFlow
                                    value={label === "Sales" ? usage / 100 : usage}
                                    format={
                                        label === "Sales"
                                            ? {
                                                style: "currency",
                                                currency: "USD",
                                                maximumFractionDigits: 0,
                                            }
                                            : undefined
                                    }
                                />{" "}
                                of{" "}
                                <motion.span
                                    className={cn(
                                        "relative transition-colors duration-150",
                                        showNextPlan && nextPlanLimit
                                            ? "text-neutral-400 dark:text-neutral-500"
                                            : "text-neutral-600 dark:text-neutral-400",
                                    )}
                                >
                                    {label === "Sales" ? "$" : ""}
                                    {formatNumber(label === "Sales" ? limit / 100 : limit)}
                                    {showNextPlan && nextPlanLimit && (
                                        <motion.span
                                            className="absolute bottom-[45%] left-0 h-[1px] bg-neutral-400 dark:bg-neutral-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{
                                                duration: 0.25,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    )}
                                </motion.span>
                            </span>
                            <AnimatePresence>
                                {showNextPlan && nextPlanLimit && (
                                    <motion.div
                                        className="flex items-center"
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: "auto", opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{
                                            duration: 0.25,
                                            ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smooth movement
                                        }}
                                    >
                                        <motion.span className="ml-1 whitespace-nowrap text-xs font-medium text-blue-600 dark:text-blue-400">
                                            {label === "Sales" ? "$" : ""}
                                            {formatNumber(
                                                label === "Sales" ? nextPlanLimit / 100 : nextPlanLimit,
                                            )}
                                        </motion.span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="h-4 w-16 animate-pulse rounded-md bg-neutral-500/10 dark:bg-neutral-400/10" />
                    )}
                </div>
                {!unlimited && (
                    <div className="mt-1.5">
                        <div
                            className={cn(
                                "h-0.5 w-full overflow-hidden rounded-full bg-neutral-900/10 transition-colors dark:bg-neutral-100/10",
                                loading && "bg-neutral-900/5 dark:bg-neutral-100/5",
                            )}
                        >
                            {!loading && (
                                <div
                                    className="animate-slide-right-fade size-full"
                                    style={{ "--offset": "-100%" } as CSSProperties}
                                >
                                    <div
                                        className={cn(
                                            "size-full rounded-full bg-gradient-to-r from-transparent to-blue-600 dark:to-blue-500",
                                            warning && "to-rose-500 dark:to-rose-400",
                                        )}
                                        style={{
                                            transform: `translateX(-${100 - Math.max(Math.floor((usage / Math.max(0, usage, limit)) * 100), usage === 0 ? 0 : 1)}%)`,
                                            transition: "transform 0.25s ease-in-out",
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    },
);

const formatNumber = (value: number) =>
    value >= INFINITY_NUMBER
        ? "∞"
        : nFormatter(value, {
            full: value !== undefined && value < 999,
            digits: 1,
        });