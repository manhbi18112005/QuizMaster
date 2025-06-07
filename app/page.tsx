"use client"

import { SmoothScrollProvider } from '@/components/smooth-scroll/SmoothScrollProvider';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Zap,
  Database,
  Upload,
  Star,
  ArrowRight,
  CheckCircle,
  Brain,
  Target,
  Users,
  Sparkles
} from "lucide-react"
import { Github } from "@/components/icons/github";
import ColourfulText from "@/components/ui/colourful-text"
import { Footer } from '@/components/admin-panel/footer';
import { motion } from 'framer-motion'
import { useState, useCallback, useMemo } from 'react'

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = useMemo(() => [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Question Banks",
      description: "Organize questions into named banks for different subjects or topics with rich categorization.",
      gradient: "from-blue-500 to-cyan-500",
      detailedDescription: "Create unlimited question banks for different subjects, topics, or difficulty levels. Each bank can be customized with names, descriptions, and categories. Perfect for organizing your study materials by subject, chapter, or exam type.",
      image: "/api/placeholder/800/400" // Replace with actual screenshot
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Rich Question Editor",
      description: "Create questions with formatted text, multiple choices, tags, categories, and difficulty levels.",
      gradient: "from-purple-500 to-pink-500",
      detailedDescription: "Advanced question editor with rich text formatting, multiple choice options, drag-and-drop answer ordering, difficulty levels, tags, and categories. Supports images, code snippets, and mathematical expressions.",
      image: "/api/placeholder/800/400"
    },
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Import/Export",
      description: "Import questions from JSON files and export your data for backup or sharing.",
      gradient: "from-orange-500 to-red-500",
      detailedDescription: "Seamlessly import questions from JSON files or export your entire question banks for backup or sharing with classmates. Supports bulk operations and maintains all question metadata.",
      image: "/api/placeholder/800/400"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Offline Support",
      description: "All data stored locally using IndexedDB - work without an internet connection.",
      gradient: "from-slate-600 to-slate-800",
      detailedDescription: "Complete offline functionality with IndexedDB storage. Your data never leaves your device, ensuring privacy and allowing you to study anywhere without internet connectivity.",
      image: "/api/placeholder/800/400"
    },
  ], [])

  const benefits = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Effective Learning",
      description: "Structured question banks help students focus on specific topics and track progress."
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Easy Sharing",
      description: "Export and share question banks with classmates, teachers, or study groups."
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Privacy First",
      description: "All data stays on your device - no accounts required, complete privacy control."
    }
  ]

  // Memoize the feature change handler
  const handleFeatureChange = useCallback((index: number) => {
    setActiveFeature(index)
  }, [])

  // Memoize the feature cards to prevent unnecessary re-renders
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
      {/* Active background indicator with CSS transition */}
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
        {feature.title}
      </div>
      <p className="relative z-10 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {feature.description}
      </p>
    </button>
  )), [features, activeFeature, handleFeatureChange])

  return (
    <>
      <SmoothScrollProvider />
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent dark:from-blue-900/10" />

        {/* Floating Elements */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl animate-pulse" />
        <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="fixed top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full blur-xl animate-pulse delay-500" />

        {/* Navigation */}
        <nav className="relative z-50 border-b border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  QuizMaster
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Link href="https://github.com/manhbi18112005/QuizMaster" target="_blank">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
                    <Github className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 pt-20 pb-32 sm:pt-32 sm:pb-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200/50 dark:border-blue-800/50 mb-8">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Modern Quiz Platform</span>
              </div>

              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                  Master Your Studies with
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-300% bg-size-300">
                  <ColourfulText text="QuizMaster" />
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                A modern, interactive quiz platform designed to help students revise and master their subjects
                through customizable question banks, instant feedback, and a beautiful interface.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-3 text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 rounded-2xl">
                    <Sparkles className="h-5 w-5" />
                    Start Creating Quizzes
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="https://github.com/manhbi18112005/QuizMaster" target="_blank">
                  <Button variant="outline" size="lg" className="gap-3 text-lg px-8 py-6 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 rounded-2xl">
                    <Github className="h-5 w-5" />
                    View on GitHub
                  </Button>
                </Link>
              </div>

              {/* Enhanced Key Stats */}
              <div className="flex flex-wrap justify-center gap-8 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">100% Offline</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <div className="p-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="font-medium">Open Source</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <div className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Zero Setup</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge variant="outline" className="mb-6 px-4 py-2 text-base rounded-full border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
                ✨ Features
              </Badge>
              <h2 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Everything you need for
                <br />effective studying
              </h2>
              <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                QuizMaster provides all the tools you need to create, organize, and practice with custom question banks.
              </p>
            </div>

            {/* Interactive Feature Showcase */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/20">
              {/* Feature Navigation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {featureCards}
              </div>

              {/* Feature Details - optimized with transform */}
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
                          {features[activeFeature].title}
                        </h3>
                      </div>
                      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                        {features[activeFeature].detailedDescription}
                      </p>
                      <Link href="/dashboard">
                        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                          Try This Feature
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="relative">
                      <motion.div
                        initial={{ opacity: 0, transform: 'scale(0.8)' }}
                        animate={{ opacity: 1, transform: 'scale(1)' }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 aspect-video flex items-center justify-center"
                        style={{ willChange: 'transform, opacity' }}
                      >
                        <div className="text-center p-8">
                          <div
                            className={`p-6 rounded-2xl bg-gradient-to-br ${features[activeFeature].gradient} text-white mb-4 inline-block shadow-lg`}
                            style={{
                              filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))'
                            }}
                          >
                            {features[activeFeature].icon}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 font-medium">
                            {features[activeFeature].title} Preview
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            Interactive demo coming soon
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative z-10 py-32 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <Badge variant="outline" className="mb-6 px-4 py-2 text-base rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
                  💡 Why QuizMaster?
                </Badge>
                <h2 className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-tight">
                  Built for students,
                  <br />by students
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed">
                  QuizMaster was created to solve real problems that students face when studying.
                  No accounts, no subscriptions, no data collection - just pure focus on learning.
                </p>

                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{benefit.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:pl-8">
                <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl overflow-hidden">
                  <CardHeader className='border-b'>
                    <CardTitle className="flex items-center gap-3 text-white text-xl">
                      <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      Start in a few easy steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 pb-3 space-y-6">
                    <div className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg flex items-center justify-center font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">1</div>
                      <div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">Create a Question Bank</p>
                        <p className="text-slate-600 dark:text-slate-300">Give it a name and description</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white text-lg flex items-center justify-center font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">2</div>
                      <div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">Add Questions</p>
                        <p className="text-slate-600 dark:text-slate-300">Use our rich editor to create questions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white text-lg flex items-center justify-center font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 group_hover:scale-110">3</div>
                      <div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">Start Studying</p>
                        <p className="text-slate-600 dark:text-slate-300">Practice and improve your knowledge</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 sm:p-16 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-5xl font-bold mb-6 text-white leading-tight">
                  Ready to enhance
                  <br />your learning?
                </h2>
                <p className="text-xl sm:text-2xl text-blue-100 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Join students worldwide who are using QuizMaster to ace their studies.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-3 text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl font-bold">
                      <Sparkles className="h-5 w-5" />
                      Get Started Now
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="https://github.com/manhbi18112005/QuizMaster" target="_blank">
                    <Button variant="outline" size="lg" className="gap-3 text-lg px-8 py-6 border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 rounded-2xl backdrop-blur-sm">
                      <Github className="h-5 w-5" />
                      Source Code
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}