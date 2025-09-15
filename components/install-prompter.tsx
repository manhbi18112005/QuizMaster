"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Download, Check, Smartphone, Zap, Wifi, Bell, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsPWA } from "@/hooks/use-pwa";
import { useTranslation } from "@/hooks/use-translation";

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
        titleKey: "installPrompter.features.instantAccess.title",
        descriptionKey: "installPrompter.features.instantAccess.description",
        colorClass: "blue"
    },
    {
        icon: Wifi,
        titleKey: "installPrompter.features.offlineReady.title",
        descriptionKey: "installPrompter.features.offlineReady.description",
        colorClass: "green"
    },
    {
        icon: Bell,
        titleKey: "installPrompter.features.smartNotifications.title",
        descriptionKey: "installPrompter.features.smartNotifications.description",
        colorClass: "purple"
    },
    {
        icon: Shield,
        titleKey: "installPrompter.features.securePrivate.title",
        descriptionKey: "installPrompter.features.securePrivate.description",
        colorClass: "orange"
    }
] as const;

export default function InstallPrompter({ isOpen }: InstallPrompterProps) {
    const isPWA = useIsPWA();
    const { t } = useTranslation();
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
            <div>
                <Button
                    onClick={handleInstallClick}
                    variant="ghost"
                    className={cn(
                        "h-9 text-sm",
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
                        {isPWA ? t("installPrompter.installed") : t("installPrompter.installApp")}
                    </p>
                    {isPWA && (
                        <span className="ml-2 text-xs text-muted-foreground">
                            {process.env.APP_VERSION || "Beta"}
                        </span>
                    )}
                </Button>
            </div>

            <Dialog open={installState.showIntroDialog} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center pb-4">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Smartphone className="h-6 w-6 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">
                            {t("installPrompter.dialog.title")}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {t("installPrompter.dialog.description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid gap-3">
                            {FEATURES.map(({ icon: Icon, titleKey, descriptionKey, colorClass }) => (
                                <div key={titleKey} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                    <div className={`w-8 h-8 bg-${colorClass}-500/10 rounded-full flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`h-4 w-4 text-${colorClass}-600`} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{t(titleKey)}</p>
                                        <p className="text-xs text-muted-foreground">{t(descriptionKey)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-xs text-muted-foreground text-center">
                                {t("installPrompter.dialog.storageNote")}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                        <Button
                            variant="ghost"
                            onClick={handleDialogClose}
                            className="w-full sm:w-auto"
                        >
                            {t("installPrompter.dialog.notNow")}
                        </Button>
                        <Button
                            onClick={handleInstallPWA}
                            className="w-full sm:w-auto group"
                        >
                            {t("installPrompter.dialog.installApp")}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
