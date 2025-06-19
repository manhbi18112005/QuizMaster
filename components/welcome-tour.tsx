"use client"

import { useEffect, useState, useCallback } from "react"
import { IntroDisclosure } from "@/components/cultui/intro-disclosure"
import { useTranslation } from "@/hooks/use-translation"

const FEATURE_INTRO_DEMO_KEY = "feature_intro-demo"

export function WelcomeTour() {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)

    const steps = [
        {
            title: t("welcome_tour.step_1.title"),
            short_description: t("welcome_tour.step_1.short_description"),
            full_description: t("welcome_tour.step_1.full_description"),
            media: {
                type: "image" as const,
                src: "/tour/1.png",
                alt: t("welcome_tour.step_1.media_alt"),
            },
        },
        {
            title: t("welcome_tour.step_2.title"),
            short_description: t("welcome_tour.step_2.short_description"),
            full_description: t("welcome_tour.step_2.full_description"),
            media: {
                type: "image" as const,
                src: "/tour/2.png",
                alt: t("welcome_tour.step_2.media_alt"),
            },
            action: {
                label: t("welcome_tour.step_2.action_label"),
                href: "/banks",
            },
        },
        {
            title: t("welcome_tour.step_3.title"),
            short_description: t("welcome_tour.step_3.short_description"),
            full_description: t("welcome_tour.step_3.full_description"),
            media: {
                type: "image" as const,
                src: "/tour/3.png",
                alt: t("welcome_tour.step_3.media_alt"),
            },
            action: {
                label: t("welcome_tour.step_3.action_label"),
                href: "/banks",
            },
        },
        {
            title: t("welcome_tour.step_4.title"),
            short_description: t("welcome_tour.step_4.short_description"),
            full_description: t("welcome_tour.step_4.full_description"),
            action: {
                label: t("welcome_tour.step_4.action_label"),
                href: "/banks",
            },
        },
    ]

    const syncIntroOpenState = useCallback(() => {
        const featureIntroStatus = localStorage.getItem(FEATURE_INTRO_DEMO_KEY)
        setOpen(featureIntroStatus === null)
    }, [])

    // Update open state on mount and whenever localStorage changes
    useEffect(() => {
        syncIntroOpenState()
        window.addEventListener("storage", syncIntroOpenState)
        return () => window.removeEventListener("storage", syncIntroOpenState)
    }, [syncIntroOpenState])

    const handleTourEnd = useCallback(() => {
        localStorage.setItem(FEATURE_INTRO_DEMO_KEY, "true")
    }, [])

    return (
        <IntroDisclosure
            open={open}
            setOpen={setOpen}
            steps={steps}
            featureId="intro-demo"
            onComplete={handleTourEnd}
            onSkip={handleTourEnd}
        />
    )
}
