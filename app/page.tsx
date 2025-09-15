import { SmoothScrollProvider } from '@/components/smooth-scroll/SmoothScrollProvider';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Zap,
  Star,
  ArrowRight,
  Sparkles,
  Database
} from "lucide-react"
import { Github } from "@/components/icons/github";
import { Footer } from '@/components/admin-panel/footer';
import LanguageSwitcher from "@/components/language-switcher";
import { InteractiveFeatures } from "@/components/home/interactive-features";

export default function Home() {
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
                  {/* {t('app.name')} */}
                  QuizMaster
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <Link href="https://github.com/manhbi18112005/QuizMaster" target="_blank">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
                    <Github className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    {/* {t('common.get_started')} */}
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
                  {/* {t("landing.heroTitle")} */}
                  Welcome to QuizMaster
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-300% bg-size-300">
                  QuizMaster
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                {/* {t("landing.heroDescription")} */}
                Create, share, and discover quizzes on any topic imaginable.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-3 text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 rounded-2xl">
                    <Sparkles className="h-5 w-5" />
                    {/* {t("landing.startCreatingQuizzes")} */}
                    Start Creating Quizzes
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="https://github.com/manhbi18112005/QuizMaster" target="_blank">
                  <Button variant="outline" size="lg" className="gap-3 text-lg px-8 py-6 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 rounded-2xl">
                    <Github className="h-5 w-5" />
                    {/* {t("landing.viewOnGithub")} */}
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
                  <span className="font-medium">Offline Capable</span>
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
        <InteractiveFeatures />
        <Footer />
      </div>
    </>
  )
}