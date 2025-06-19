"use client";

import { ReactNode, Suspense } from "react";
import { MouseCursorProvider } from '@/components/mouse-cursor/provider';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import I18nProvider from "@/components/providers/i18n-provider";
import { SessionProvider } from "next-auth/react"
import LoadingScreen from "@/components/loading-screen";
import { ModalProvider } from "@/components/modals/model-provider";
import PageTracker from '@/components/page-tracker';
import { KeyboardShortcutProvider } from "@/hooks/use-keyboard-shortcut";

export default function RootProviders({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <I18nProvider>
                <KeyboardShortcutProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <ModalProvider>
                            <Suspense fallback={<LoadingScreen />}>
                                <MouseCursorProvider />
                                <Toaster />
                                <TooltipProvider disableHoverableContent>
                                    <PageTracker />
                                    {children}
                                </TooltipProvider>
                            </Suspense>
                        </ModalProvider>
                    </ThemeProvider>
                </KeyboardShortcutProvider>
            </I18nProvider>
        </SessionProvider>
    );
}