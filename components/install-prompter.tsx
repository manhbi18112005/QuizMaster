"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Download, Check, Smartphone, Zap, Wifi, Bell, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import { useIsPWA } from "@/hooks/use-pwa";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

interface InstallPrompterProps {
    isOpen?: boolean;
}

interface InstallState {
    isInstallable: boolean;
    deferredPrompt: BeforeInstallPromptEvent | null;
    showIntroDialog: boolean;
}

const FEATURES = [
    {
        icon: Zap,
        title: "Instant Access",
        description: "Launch directly from your home screen without opening a browser",
        colorClass: "blue"
    },
    {
        icon: Wifi,
        title: "Offline Ready",
        description: "Continue creating and taking quizzes even without internet connection",
        colorClass: "green"
    },
    {
        icon: Bell,
        title: "Smart Notifications",
        description: "Get notified about quiz updates and new features",
        colorClass: "purple"
    },
    {
        icon: Shield,
        title: "Secure & Private",
        description: "Your data stays safe with enhanced security features",
        colorClass: "orange"
    }
] as const;

export default function InstallPrompter({ isOpen }: InstallPrompterProps) {
    const isPWA = useIsPWA();
    const [installState, setInstallState] = useState<InstallState>({
        isInstallable: false,
        deferredPrompt: null,
        showIntroDialog: false
    });

    const isDisabled = useMemo(() => !installState.isInstallable || isPWA, [installState.isInstallable, isPWA]);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallState(prev => ({
                ...prev,
                deferredPrompt: e as BeforeInstallPromptEvent,
                isInstallable: true
            }));
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = useCallback(() => {
        if (isDisabled) return;
        setInstallState(prev => ({ ...prev, showIntroDialog: true }));
    }, [isDisabled]);

    const handleInstallPWA = useCallback(async () => {
        const { deferredPrompt } = installState;
        setInstallState(prev => ({ ...prev, showIntroDialog: false }));

        if (!deferredPrompt || isPWA) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setInstallState(prev => ({
                    ...prev,
                    isInstallable: false,
                    deferredPrompt: null
                }));
            }
        } catch {
            // Silently handle errors
        }
    }, [installState, isPWA]);

    const handleDialogClose = useCallback(() => {
        setInstallState(prev => ({ ...prev, showIntroDialog: false }));
    }, []);

    return (
        <>
            <li className="w-full">
                <TooltipProvider disableHoverableContent>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={handleInstallClick}
                                variant={isPWA ? "default" : "ghost"}
                                className={cn(
                                    "w-full justify-center h-10",
                                    isDisabled && "opacity-75 cursor-not-allowed"
                                )}
                                disabled={isDisabled}
                            >
                                <span className={cn(isOpen === false ? "" : "mr-4")}>
                                    {isPWA ? <Check size={18} /> : <Download size={18} />}
                                </span>
                                <p
                                    className={cn(
                                        "whitespace-nowrap",
                                        isOpen === false ? "opacity-0 hidden" : "opacity-100"
                                    )}
                                >
                                    {isPWA ? "Installed" : "Install App"}
                                </p>
                            </Button>
                        </TooltipTrigger>
                        {isOpen === false && (
                            <TooltipContent side="right">
                                {isPWA ? "Installed" : "Install App"}
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </li>

            <Dialog open={installState.showIntroDialog} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center pb-4">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Smartphone className="h-6 w-6 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">
                            Install QuizMaster
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Transform your browser experience into a native app
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid gap-3">
                            {FEATURES.map(({ icon: Icon, title, description, colorClass }) => (
                                <div key={title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                    <div className={`w-8 h-8 bg-${colorClass}-500/10 rounded-full flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`h-4 w-4 text-${colorClass}-600`} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{title}</p>
                                        <p className="text-xs text-muted-foreground">{description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-xs text-muted-foreground text-center">
                                Installing takes just a few seconds and uses minimal storage space
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                        <Button
                            variant="ghost"
                            onClick={handleDialogClose}
                            className="w-full sm:w-auto"
                        >
                            Not Now
                        </Button>
                        <Button
                            onClick={handleInstallPWA}
                            className="w-full sm:w-auto group"
                        >
                            Install App
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
