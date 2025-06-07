"use client";

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useCallback, Suspense } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import LoadingScreen from "@/components/loading-screen";
import { ClientOnly } from "@/components/ui/client-only";
import { Grid } from "@/components/ui/grid";
import { useTheme } from "next-themes";
//I'm gay

const GRID_CONFIG = {
    cellSize: 60,
    patternOffset: [0.75, 0] as [number, number],
    width: 1200,
    topOffset: 6,
    blurSize: 80,
} as const;

const GRADIENT_CLASSES = [
    "mix-blend-overlay",
    "opacity-10",
] as const;

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
    const { setTheme, theme } = useTheme();
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const callbackUrl = useMemo(() =>
        searchParams.get('callbackUrl') || '/dashboard',
        [searchParams]
    );

    // Force light theme for auth pages
    useEffect(() => {
        if (theme !== 'light') {
            setTheme('light');
        }
    }, [theme, setTheme]);

    const handleRedirect = useCallback(() => {
        if (status === "authenticated" && session) {
            router.replace(callbackUrl);
        }
    }, [status, session, router, callbackUrl]);

    useEffect(() => {
        handleRedirect();
    }, [handleRedirect]);

    const isLoadingOrRedirecting = status === "loading" || status === "authenticated";

    if (isLoadingOrRedirecting) {
        return (
            <ContentLayout showNavbar={false} title={status === "loading" ? "Loading" : "Redirecting"}>
                <div className="flex min-h-screen flex-col items-center justify-center">
                    <LoadingScreen />
                    {status === "authenticated" && (
                        <div className="text-center text-sm text-muted-foreground mt-4">
                            Redirecting to dashboard...
                        </div>
                    )}
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout showNavbar={false} title="Authentication">
            <div className="flex min-h-screen flex-col items-center justify-center relative px-8 sm:px-0">
                <Link
                    href={callbackUrl || "/"}
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "absolute left-4 top-4 md:left-8 md:top-8"
                    )}
                    prefetch={false}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Link>

                <div className="grow basis-0">
                    <div className="h-24" />
                </div>
                <ClientOnly className="relative flex w-full flex-col items-center justify-center px-4">
                    <Suspense>{children}</Suspense>
                </ClientOnly>
                <div className="flex grow basis-0 flex-col justify-end">
                    <p className="px-20 py-8 text-center text-xs font-medium text-neutral-500 md:px-0">
                        By continuing, you agree to Quiz Master&rsquo;s{" "}
                        <a
                            href="/legal/terms"
                            target="_blank"
                            className="font-semibold text-neutral-600 hover:text-neutral-800"
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="/legal/privacy"
                            target="_blank"
                            className="font-semibold text-neutral-600 hover:text-neutral-800"
                        >
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </ContentLayout>
    );
}

function BackgroundGrid() {
    return (
        <div
            className={cn(
                `absolute inset-y-0 left-1/2 w-[${GRID_CONFIG.width}px] -translate-x-1/2`,
                "[mask-composite:intersect] [mask-image:linear-gradient(black,transparent_320px),linear-gradient(90deg,transparent,black_5%,black_95%,transparent)]",
            )}
        >
            <Grid
                cellSize={GRID_CONFIG.cellSize}
                patternOffset={GRID_CONFIG.patternOffset}
                className="text-neutral-200"
            />
        </div>
    );
}

function BackgroundGradients() {
    return (
        <>
            {GRADIENT_CLASSES.map((blendClass, idx) => (
                <div
                    key={idx}
                    className={cn(
                        `absolute left-1/2 top-${GRID_CONFIG.topOffset} size-[${GRID_CONFIG.blurSize}px] -translate-x-1/2 -translate-y-1/2 scale-x-[1.6]`,
                        blendClass,
                    )}
                >
                    {Array.from({ length: idx === 0 ? 2 : 1 }, (_, innerIdx) => (
                        <div
                            key={innerIdx}
                            className={cn(
                                "absolute -inset-16 mix-blend-overlay blur-[50px] saturate-[2]",
                                "bg-[conic-gradient(from_90deg,#F00_5deg,#EAB308_63deg,#5CFF80_115deg,#1E00FF_170deg,#855AFC_220deg,#3A8BFD_286deg,#F00_360deg)]",
                            )}
                        />
                    ))}
                </div>
            ))}
        </>
    );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="absolute inset-0 isolate overflow-hidden bg-white">
                <BackgroundGrid />
                <BackgroundGradients />
            </div>

            <AuthLayoutContent>{children}</AuthLayoutContent>
        </>
    );
}