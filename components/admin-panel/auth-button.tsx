"use client";

import { LogOut, LogIn, Loader2 } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";

interface AuthButtonProps {
    isOpen: boolean | undefined;
}

export function AuthButton({ isOpen }: AuthButtonProps) {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";
    const isCollapsed = isOpen === false;

    const handleAuthAction = () => {
        if (session) {
            signOut();
        } else {
            signIn();
        }
    };

    const buttonContent = useMemo(() => {
        if (isLoading) {
            return {
                icon: <Loader2 size={18} className="animate-spin" />,
                text: "Loading..."
            };
        }

        const isSignedIn = !!session;
        return {
            icon: isSignedIn ? <LogOut size={18} /> : <LogIn size={18} />,
            text: isSignedIn ? "Sign out" : "Sign in"
        };
    }, [isLoading, session]);

    return (
        <TooltipProvider disableHoverableContent>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    <Button
                        onClick={handleAuthAction}
                        variant="outline"
                        className="w-full justify-center h-10 mt-5"
                        disabled={isLoading}
                    >
                        <span className={cn(!isCollapsed && "mr-4")}>
                            {buttonContent.icon}
                        </span>
                        <p
                            className={cn(
                                "whitespace-nowrap transition-opacity",
                                isCollapsed ? "opacity-0 hidden" : "opacity-100"
                            )}
                        >
                            {buttonContent.text}
                        </p>
                    </Button>
                </TooltipTrigger>
                {isCollapsed && (
                    <TooltipContent side="right">
                        {buttonContent.text}
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
}
