"use client"

import { useEffect, useState, useContext } from "react"
import { getAllQuestionBanks } from "@/lib/db"
import { ModalContext } from "@/components/modals/model-provider"
import { useRouter } from "next/navigation";
import { BANKPREFIX_URL } from "@/lib/client-constants"
import LoadingScreen from "@/components/loading-screen"
import { WelcomeTour } from "@/components/welcome-tour";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { BookOpen, Users, BarChart3, Zap, ArrowRight, Sparkles } from "lucide-react"
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function DashboardPage() {
  const router = useRouter();
  const { setShowAddWorkspaceModal } = useContext(ModalContext);
  const [isLoading, setIsLoading] = useState(true);
  const [, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banks = await getAllQuestionBanks()
        if (banks.length === 0) {
          setShowOnboarding(true)
        }
        else {
          router.push(`${BANKPREFIX_URL}/${banks[0].id}`)
        }
      } catch (error) {
        console.error("Failed to fetch question banks:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBanks()
  }, [router, setShowAddWorkspaceModal])

  if (isLoading) {
    return (
      <LoadingScreen />
    )
  }

  const onboardingSteps = [
    {
      title: "Welcome to QuizMaster! 👋",
      description: "Let's get you set up in just a few simple steps.",
      action: "Get Started",
      icon: Sparkles
    },
    {
      title: "Create Your First Workspace",
      description: "Workspaces help you organize your question banks and collaborate with your team.",
      action: "Create Workspace",
      icon: BookOpen
    },
    {
      title: "You're All Set! 🎉",
      description: "Your workspace is ready. You can now start creating questions and building quizzes.",
      action: "Go to Workspace",
      icon: Zap
    }
  ];

  const currentStepData = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep === 1) {
      setShowAddWorkspaceModal(true);
    } else if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <ContentLayout className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <WelcomeTour />

      <div className="w-full max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4">
            {onboardingSteps.map((_, index) => (
              <div key={index} className="flex items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: index <= currentStep ? 1 : 0.8,
                    backgroundColor: index <= currentStep ? "#3b82f6" : undefined
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${index <= currentStep
                      ? "bg-blue-600 dark:bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-600"
                    }`}
                >
                  {index + 1}
                </motion.div>
                {index < onboardingSteps.length - 1 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: "3rem",
                      backgroundColor: index < currentStep ? "#3b82f6" : undefined
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`h-1 mx-4 ${index < currentStep
                        ? "bg-blue-600 dark:bg-blue-500"
                        : "bg-gray-300 dark:bg-gray-600"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4"
          >
            Step {currentStep + 1} of {onboardingSteps.length}
          </motion.p>
        </motion.div>

        {/* Main Onboarding Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <currentStepData.icon className="w-10 h-10 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {currentStepData.title}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                  {currentStepData.description}
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="px-12 pb-12">
              {/* Step-specific content */}
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-gray-700 dark:text-gray-300">Question Banks</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-gray-700 dark:text-gray-300">Team Collaboration</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-gray-700 dark:text-gray-300">Analytics</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                      <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-gray-700 dark:text-gray-300">Quick Setup</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is a workspace?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      A workspace is like a question bank that helps you manage and organize questions by topic or subject.
                      Each workspace contains your questions, quiz templates, and analytics all in one organized space.
                    </p>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What is next?</h4>
                    <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                        Create your first question bank
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                        Add questions to your bank
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-3"></div>
                        Generate and share quizzes
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mt-8"
              >
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold"
                >
                  {currentStepData.action}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ContentLayout>
  )
}