"use client";

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { ContentLayout } from "@/components/admin-panel/content-layout"
import LoadingScreen from "@/components/loading-screen";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    useEffect(() => {
        if (status === "authenticated" && session) {
            router.replace(callbackUrl)
        }
    }, [status, session, router, callbackUrl])

    if (status === "loading") {
        return (
            <ContentLayout showNavbar={false} title="Loading">
                <LoadingScreen />
            </ContentLayout>
        )
    }

    if (status === "authenticated") {
        return (
            <ContentLayout showNavbar={false} title="Redirecting">
                <div className="flex min-h-screen flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                    <div className="text-center text-sm text-muted-foreground">Redirecting...</div>
                </div>
            </ContentLayout>
        )
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
                    <>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                    </>
                </Link>
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    {children}
                </div>
            </div>
        </ContentLayout>
    )
}