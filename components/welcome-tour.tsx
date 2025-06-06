"use client"

import { useEffect, useState, useCallback } from "react"
import { IntroDisclosure } from "@/components/cultui/intro-disclosure"

const steps = [
    {
        title: "Welcome to QuizMaster",
        short_description: "Your personal quiz creation platform",
        full_description:
            "Welcome to QuizMaster! A modern, offline-first quiz platform designed to help students create, organize, and practice with custom question banks. Let's explore what makes it special.",
        media: {
            type: "image" as const,
            src: "/tour/1.png",
            alt: "QuizMaster dashboard overview",
        },
    },
    {
        title: "Create Question Banks",
        short_description: "Organize your study materials",
        full_description:
            "Start by creating question banks for different subjects or topics. Each bank can contain multiple questions with rich formatting, multiple choice answers, tags, and difficulty levels.",
        media: {
            type: "image" as const,
            src: "/tour/2.png",
            alt: "Question bank creation interface",
        },
        action: {
            label: "Create Your First Bank",
            href: "/banks",
        },
    },
    {
        title: "Rich Question Editor",
        short_description: "Craft detailed questions",
        full_description:
            "Use our powerful editor to create questions with formatted text, multiple choices, correct answers, tags, categories, and notes. Drag and drop to reorder questions as needed.",
        media: {
            type: "image" as const,
            src: "/tour/3.png",
            alt: "Question editor interface",
        },
        action: {
            label: "Explore Editor Features",
            href: "/banks",
        },
    },
    {
        title: "Import & Export",
        short_description: "Share and backup your work",
        full_description:
            "Import questions from JSON files or export your question banks to share with classmates or backup your work. Everything works offline using your browser's local storage.",
        action: {
            label: "Start Creating Questions",
            href: "/banks",
        },
    },
]

const FEATURE_INTRO_DEMO_KEY = "feature_intro-demo"

export function WelcomeTour() {
    const [open, setOpen] = useState(false)

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
