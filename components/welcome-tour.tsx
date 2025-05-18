"use client"

import { useEffect, useState, useCallback } from "react"
import { IntroDisclosure } from "@/components/cultui/intro-disclosure"

const steps = [
    {
        title: "Welcome to QuizMaster",
        short_description: "Create and manage your quizzes",
        full_description:
            "Welcome to QuizMaster! Let's explore how you can easily create, edit, and manage your quizzes with our intuitive platform.",
        media: {
            type: "image" as const,
            src: "/tour/1.png",
            alt: "QuizMaster dashboard overview",
        },
    },
    {
        title: "Powerful Question Editor",
        short_description: "Craft engaging questions",
        full_description:
            "Our question editor allows you to create various types of questions, add multimedia, and set correct answers with ease. Make your quizzes interactive and fun!",
        media: {
            type: "image" as const,
            src: "/tour/2.png",
            alt: "Question editor interface",
        },
        action: {
            label: "Explore Editor Features",
            href: "/docs/editor",
        },
    },
    {
        title: "Insightful Answer Viewer",
        short_description: "Review responses and results",
        full_description:
            "Track submissions and analyze results with our comprehensive answer viewer. Understand performance and gain insights from your quizzes.",
        media: {
            type: "image" as const,
            src: "/tour/3.png",
            alt: "Answer viewer interface",
        },
        action: {
            label: "Learn About Analytics",
            href: "/docs/analytics",
        },
    },
    {
        title: "Start Creating Quizzes",
        short_description: "Begin your quiz-making journey",
        full_description:
            "You're all set to start! Dive into QuizMaster and begin creating engaging quizzes for your audience.",
        action: {
            label: "Create Your First Quiz",
            href: "/",
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
