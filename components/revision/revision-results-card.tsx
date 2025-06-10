/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    Trophy,
    Clock,
    Target,
    Flag,
    AlertCircle,
    Zap,
    BookOpen,
    TrendingUp,
    ChevronDown,
} from "lucide-react";
import { TestResults } from "@/types/test-results";
import { TestSettingsType } from "@/types/test-settings";
import { useMemo, useState } from "react";

interface TestResultsCardProps {
    testResults: TestResults;
    answers: Record<number, string>;
    questionTimes: Record<number, number>;
    timeLeft: number;
    settings: TestSettingsType;
    onBackToSettings: () => void;
    onRetakeTest?: () => void;
    formatTime: (seconds: number) => string;
}

// Grade configuration
const GRADE_CONFIG = {
    A: { threshold: 90, label: 'Excellent!', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', gridColor: '#10B981' },
    B: { threshold: 80, label: 'Good Job!', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', gridColor: '#3B82F6' },
    C: { threshold: 70, label: 'Well Done!', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', gridColor: '#F59E0B' },
    D: { threshold: 60, label: 'Keep Trying!', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', gridColor: '#F97316' },
    F: { threshold: 0, label: 'Need Improvement', color: 'text-red-600', bg: 'bg-red-50 border-red-200', gridColor: '#EF4444' }
} as const;

// Badge color configurations
const BADGE_COLORS = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
} as const;

// Insight configurations
const INSIGHTS_CONFIG = [
    {
        condition: (score: number) => score >= 90,
        icon: Trophy,
        title: 'Outstanding Performance!',
        description: 'You\'ve mastered this material completely.',
        colorScheme: 'emerald'
    },
    {
        condition: (score: number) => score >= 70 && score < 90,
        icon: CheckCircle,
        title: 'Good Work!',
        description: 'Consider reviewing the questions you missed.',
        colorScheme: 'blue'
    },
    {
        condition: (score: number) => score < 70,
        icon: BookOpen,
        title: 'More Study Needed',
        description: 'Focus on the areas where you struggled.',
        colorScheme: 'amber'
    }
] as const;

const getGradeInfo = (score: number) => {
    return Object.entries(GRADE_CONFIG).find(([_, config]) => score >= config.threshold)?.[1] || GRADE_CONFIG.F;
};

// Reusable components
const StatCard = ({ icon: Icon, value, label, iconColor }: {
    icon: React.ComponentType<{ className?: string }>;
    value: string | number;
    label: string;
    iconColor: string;
}) => (
    <div className="text-center p-4 rounded-lg bg-muted/30">
        <Icon className={`h-5 w-5 mx-auto mb-2 ${iconColor}`} />
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
    </div>
);

const InsightCard = ({ icon: Icon, title, description, colorScheme }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    colorScheme: keyof typeof BADGE_COLORS;
}) => {
    const colorClass = BADGE_COLORS[colorScheme];
    const iconColorMap = {
        emerald: 'text-emerald-600 dark:text-emerald-400',
        blue: 'text-blue-600 dark:text-blue-400',
        green: 'text-green-600 dark:text-green-400',
        amber: 'text-amber-600 dark:text-amber-400',
    };

    return (
        <div className={`flex items-start gap-3 p-3 ${colorClass} border rounded-lg`}>
            <Icon className={`h-5 w-5 ${iconColorMap[colorScheme]} mt-0.5 flex-shrink-0`} />
            <div>
                <p className={`text-sm font-medium ${colorScheme === 'emerald' ? 'text-emerald-800 dark:text-emerald-200' :
                    colorScheme === 'blue' ? 'text-blue-800 dark:text-blue-200' :
                        colorScheme === 'amber' ? 'text-amber-800 dark:text-amber-200' :
                            'text-green-800 dark:text-green-200'}`}>
                    {title}
                </p>
                <p className={`text-xs mt-1 ${colorScheme === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                    colorScheme === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        colorScheme === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                            'text-green-600 dark:text-green-400'}`}>
                    {description}
                </p>
            </div>
        </div>
    );
};

export function TestResultsCard({
    testResults,
    answers,
    questionTimes,
    timeLeft,
    settings,
    onBackToSettings,
    onRetakeTest,
    formatTime
}: TestResultsCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    // Memoize expensive calculations
    const calculations = useMemo(() => {
        const accuracyRate = Math.round((testResults.correctAnswers / testResults.totalQuestions) * 100);
        const unansweredCount = testResults.totalQuestions - Object.keys(answers).length;
        const avgTimePerQuestion = Math.floor((testResults.timeSpent / 1000) / testResults.totalQuestions);

        const validTimes = Object.values(questionTimes).filter(t => t > 0);
        const fastestTime = validTimes.length > 0 ? Math.min(...validTimes) : 0;
        const slowestTime = validTimes.length > 0 ? Math.max(...validTimes) : 0;

        return {
            accuracyRate,
            unansweredCount,
            avgTimePerQuestion,
            fastestTime,
            slowestTime
        };
    }, [testResults, answers, questionTimes]);

    const gradeInfo = useMemo(() => getGradeInfo(testResults.score), [testResults.score]);

    // Generate insights based on test performance
    const insights = useMemo(() => {
        const results = [];

        // Score-based insights
        INSIGHTS_CONFIG.forEach(config => {
            if (config.condition(testResults.score)) {
                results.push({
                    icon: config.icon,
                    title: config.title,
                    description: config.description,
                    colorScheme: config.colorScheme
                });
            }
        });

        // Additional conditional insights
        if (testResults.flaggedQuestions.length > 0) {
            results.push({
                icon: Flag,
                title: 'Review Flagged Questions',
                description: `You flagged ${testResults.flaggedQuestions.length} questions for review.`,
                colorScheme: 'amber' as const
            });
        }

        if (calculations.unansweredCount > 0) {
            results.push({
                icon: AlertCircle,
                title: 'Incomplete Test',
                description: `You left ${calculations.unansweredCount} questions unanswered.`,
                colorScheme: 'amber' as const
            });
        }

        if (calculations.avgTimePerQuestion < 30) {
            results.push({
                icon: Zap,
                title: 'Quick Responder',
                description: 'You answered quickly! Make sure you read each question carefully.',
                colorScheme: 'blue' as const
            });
        }

        if (calculations.avgTimePerQuestion > 120) {
            results.push({
                icon: Clock,
                title: 'Thoughtful Approach',
                description: 'You took your time with each question - thoroughness is valuable!',
                colorScheme: 'blue' as const
            });
        }

        return results;
    }, [testResults.score, testResults.flaggedQuestions.length, calculations]);

    const statCards = useMemo(() => [
        { icon: Target, value: testResults.correctAnswers, label: 'Correct', iconColor: 'text-emerald-600' },
        { icon: BookOpen, value: testResults.totalQuestions, label: 'Total', iconColor: 'text-blue-600' },
        { icon: Clock, value: formatTime(Math.floor(testResults.timeSpent / 1000)), label: 'Total Time', iconColor: 'text-purple-600' },
        { icon: TrendingUp, value: formatTime(calculations.avgTimePerQuestion), label: 'Avg/Question', iconColor: 'text-amber-600' }
    ], [testResults, calculations.avgTimePerQuestion, formatTime]);

    return (
        <div className="space-y-6">
            <Card className="relative border-2 bg-gradient-to-br from-background to-muted/20 overflow-hidden">
                <FlickeringGrid
                    className="absolute inset-0 z-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
                    squareSize={5}
                    gridGap={8}
                    color={gradeInfo.gridColor}
                    maxOpacity={0.4}
                    flickerChance={0.05}
                />

                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="relative z-10 text-center cursor-pointer hover:bg-muted/20 transition-colors duration-200 rounded-t-lg"
                >
                    <CardHeader className="pb-4">
                        <motion.div
                            className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Trophy className="h-8 w-8 text-emerald-600" />
                        </motion.div>
                        <div className="flex items-center justify-center gap-2">
                            <CardTitle className="text-2xl font-bold">Test Complete!</CardTitle>
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            </motion.div>

                        </div>
                        <p className="text-muted-foreground">
                            {isExpanded ? "Here are your results" : "Click to view detailed results"}
                        </p>

                        <div className="text-center mb-6">
                            <div className="text-6xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                {testResults.score}%
                            </div>
                            <Badge variant="secondary" className={`${gradeInfo.bg} ${gradeInfo.color} border px-4 py-1 text-lg font-semibold`}>
                                Grade {Object.entries(GRADE_CONFIG).find(([_, config]) => config === gradeInfo)?.[0]} • {gradeInfo.label}
                            </Badge>
                        </div>
                    </CardHeader>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            key="expanded-content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: "easeInOut"
                            }}
                            style={{ overflow: "hidden" }}
                        >
                            <CardContent className="relative z-10 pt-0">
                                <motion.div
                                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                                >
                                    {statCards.map((stat, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.15 + index * 0.03, duration: 0.2, ease: "easeOut" }}
                                        >
                                            <StatCard {...stat} />
                                        </motion.div>
                                    ))}
                                </motion.div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Overall Progress</span>
                                        <span className="text-sm text-muted-foreground">
                                            {testResults.correctAnswers} of {testResults.totalQuestions} correct
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Progress value={0} className="h-3 bg-muted/50" />
                                        <motion.div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${calculations.accuracyRate}%` }}
                                            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <motion.div
                                    className="grid md:grid-cols-2 gap-6 md:divide-x md:divide-muted/50"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                                >
                                    <div className="space-y-4 md:pr-6">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Target className="h-5 w-5 text-emerald-600" />
                                            Performance Breakdown
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                    Accuracy Rate
                                                </span>
                                                <Badge variant="secondary" className={BADGE_COLORS.emerald}>
                                                    {calculations.accuracyRate}%
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm flex items-center gap-2">
                                                    <Flag className="w-3 h-3 text-amber-500" />
                                                    Questions Flagged
                                                </span>
                                                <Badge variant="outline">{testResults.flaggedQuestions.length}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm flex items-center gap-2">
                                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                                    Unanswered
                                                </span>
                                                <Badge variant={calculations.unansweredCount > 0 ? "destructive" : "outline"}>
                                                    {calculations.unansweredCount}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 md:pl-6">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                            Time Analysis
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Fastest Question</span>
                                                <Badge variant="outline" className={BADGE_COLORS.green}>
                                                    {formatTime(Math.floor(calculations.fastestTime / 1000))}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Slowest Question</span>
                                                <Badge variant="outline" className={BADGE_COLORS.amber}>
                                                    {formatTime(Math.floor(calculations.slowestTime / 1000))}
                                                </Badge>
                                            </div>
                                            {settings.hasTimeLimit && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">Time Remaining</span>
                                                    <Badge variant="outline" className={BADGE_COLORS.blue}>
                                                        {formatTime(timeLeft)}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                <Separator className="my-6" />

                                <motion.div
                                    className="space-y-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
                                >
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                        Performance Insights
                                    </h3>
                                    <div className="grid gap-3">
                                        {insights.map((insight, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.35 + index * 0.05, duration: 0.2, ease: "easeOut" }}
                                            >
                                                <InsightCard {...insight} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>

                <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-center relative z-10 border-t">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                    >
                        <Button onClick={onBackToSettings} variant="outline" size="lg" className="w-full sm:w-auto sm:min-w-[140px]">
                            <BookOpen className="w-4 h-4 mr-2" />
                            New Test
                        </Button>
                    </motion.div>
                    {settings.allowRetake && onRetakeTest && (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.1 }}
                        >
                            <Button onClick={onRetakeTest} size="lg" className="w-full sm:w-auto sm:min-w-[140px]">
                                <Target className="w-4 h-4 mr-2" />
                                Retake Test
                            </Button>
                        </motion.div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
