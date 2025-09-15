'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    BookOpen,
    Play,
    Upload,
    ArrowRight,
    Brain,
} from "lucide-react"
import { useTranslation } from '@/hooks/use-translation'
import { VideoPlayerThumbnail } from "@/components/ui/video-player-modal"

export function InteractiveFeatures() {
    const [activeFeature, setActiveFeature] = useState(0)
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
    const { t } = useTranslation()

    const features = useMemo(() => [
        {
            icon: <BookOpen className="h-6 w-6" />,
            titleKey: "landing.features.questionBanks.title",
            descriptionKey: "landing.features.questionBanks.description",
            detailedDescriptionKey: "landing.features.questionBanks.detailedDescription",
            gradient: "from-blue-500 to-cyan-500",
            assets: "/tour/video/question.mp4",
        },
        {
            icon: <Brain className="h-6 w-6" />,
            titleKey: "landing.features.richEditor.title",
            descriptionKey: "landing.features.richEditor.description",
            detailedDescriptionKey: "landing.features.richEditor.detailedDescription",
            gradient: "from-purple-500 to-pink-500",
            assets: "/tour/video/question.mp4",
        },
        {
            icon: <Upload className="h-6 w-6" />,
            titleKey: "landing.features.importExport.title",
            descriptionKey: "landing.features.importExport.description",
            detailedDescriptionKey: "landing.features.importExport.detailedDescription",
            gradient: "from-orange-500 to-red-500",
            assets: "/tour/video/import.mp4",
        },
        {
            icon: <Play className="h-6 w-6" />,
            titleKey: "landing.features.practiceSupport.title",
            descriptionKey: "landing.features.practiceSupport.description",
            detailedDescriptionKey: "landing.features.practiceSupport.detailedDescription",
            gradient: "from-slate-600 to-slate-800",
            assets: "/tour/video/revision.mp4",
        },
    ], [])

    const handleFeatureChange = useCallback((index: number) => {
        const currentVideo = videoRefs.current[activeFeature]
        if (currentVideo) {
            currentVideo.pause()
        }

        setActiveFeature(index)

        setTimeout(() => {
            const newVideo = videoRefs.current[index]
            if (newVideo) {
                newVideo.play().catch(console.error)
            }
        }, 100)
    }, [activeFeature])

    useEffect(() => {
        const timer = setTimeout(() => {
            const firstVideo = videoRefs.current[0]
            if (firstVideo) {
                firstVideo.play().catch(console.error)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    const featureCards = useMemo(() => features.map((feature, index) => (
        <button
            key={index}
            className={`group relative flex flex-col items-start p-6 text-left rounded-2xl transition-all duration-200 will-change-transform ${activeFeature === index ? 'ring-2 ring-blue-200/50 dark:ring-blue-700/50' : ''
                }`}
            style={{
                transform: activeFeature === index ? 'scale(1.02)' : 'scale(1)',
                willChange: 'transform, opacity'
            }}
            onClick={() => handleFeatureChange(index)}
        >
            <div
                className={`absolute inset-0 rounded-2xl transition-all duration-200 ${activeFeature === index
                    ? 'bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/50 dark:to-purple-950/50 border-2 border-blue-200/50 dark:border-blue-700/50 opacity-100'
                    : 'opacity-0'
                    }`}
            />

            <div
                className={`relative z-10 mb-4 p-3 rounded-xl transition-all duration-200 ${activeFeature === index
                    ? `bg-gradient-to-br ${feature.gradient} text-white shadow-lg`
                    : `bg-gradient-to-br ${feature.gradient} opacity-30 text-slate-600 dark:text-slate-300 group-hover:opacity-70 group-hover:text-white`
                    }`}
            >
                {feature.icon}
            </div>
            <div className="relative z-10 mb-2 text-lg font-bold text-slate-900 dark:text-white">
                {t(feature.titleKey)}
            </div>
            <p className="relative z-10 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t(feature.descriptionKey)}
            </p>
        </button>
    )), [features, activeFeature, handleFeatureChange, t])

    return (
        <section id="features" className="relative z-10 py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <Badge variant="outline" className="mb-6 px-4 py-2 text-base rounded-full border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
                        ✨ Features
                    </Badge>
                    <h2 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        {t("landing.features.title")}
                        <br /><span className="bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent animate-gradient bg-300% bg-size-300">{t("landing.features.subtitle")}</span>
                    </h2>
                    <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        {t("landing.features.description")}
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                        {featureCards}
                    </div>

                    <div className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                        <motion.div
                            key={activeFeature}
                            initial={{ opacity: 0, transform: 'translateY(50px)' }}
                            animate={{ opacity: 1, transform: 'translateY(0px)' }}
                            transition={{ duration: 0.5 }}
                            className="p-8"
                            style={{ willChange: 'transform, opacity' }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${features[activeFeature].gradient} text-white shadow-lg`}>
                                            {features[activeFeature].icon}
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                            {t(features[activeFeature].titleKey)}
                                        </h3>
                                    </div>
                                    <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                        {t(features[activeFeature].detailedDescriptionKey)}
                                    </p>
                                    <Link href="/dashboard">
                                        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                            {t("landing.features.tryThisFeature")}
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                                <div className="relative">
                                    <VideoPlayerThumbnail
                                        videoSrc={features[activeFeature].assets}
                                        title={t(features[activeFeature].titleKey)}
                                        className="w-full"
                                        onVideoClick={() => {
                                            const currentVideo = videoRefs.current[activeFeature]
                                            if (currentVideo) {
                                                currentVideo.pause()
                                            }
                                        }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, transform: 'scale(0.8)' }}
                                            animate={{ opacity: 1, transform: 'scale(1)' }}
                                            transition={{ duration: 0.3, delay: 0.2 }}
                                            className="rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 aspect-video"
                                            style={{ willChange: 'transform, opacity' }}
                                        >
                                            <video
                                                ref={(el) => {
                                                    videoRefs.current[activeFeature] = el
                                                }}
                                                key={features[activeFeature].assets}
                                                src={features[activeFeature].assets}
                                                loop
                                                muted
                                                playsInline
                                                preload="metadata"
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>
                                    </VideoPlayerThumbnail>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
