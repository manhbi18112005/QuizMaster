"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag, Pause, Play, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Question } from "@/types/quiz";
import { TestSettingsType } from "@/types/test-settings";
import { TipTapViewer } from "../tiptap-viewer";
import { TestResultsCard } from "./revision-results-card";
import { TestResults, QuestionResult } from "@/types/test-results";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import { BorderBeam } from "@/components/magicui/border-beam";
import { getQuestionTypeConfig, validateQuestionAnswers, detectQuestionType } from "@/lib/question-types";
import { ModalContext } from "@/components/modals/model-provider";
import { useTranslation } from "@/hooks/use-translation";

interface TestComponentProps {
    questions: Question[];
    settings: TestSettingsType;
    onTestComplete: (results: TestResults) => void;
    onBackToSettings: () => void;
    onRetakeTest?: () => void;
}

interface VirtualizedRange {
    start: number;
    end: number;
}

const NAVIGATOR_PAGE_SIZE = 50; // Show 50 questions per page in navigator
const RESULTS_PAGE_SIZE = 20; // Show 20 results per page

export function TestComponent({
    questions,
    settings,
    onTestComplete,
    onBackToSettings,
    onRetakeTest
}: TestComponentProps) {
    const { t } = useTranslation();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string[]>>({});
    const [inputAnswers, setInputAnswers] = useState<Record<number, string>>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState(settings.hasTimeLimit ? settings.timeLimitMinutes * 60 : 0);
    const [questionTimeLeft, setQuestionTimeLeft] = useState(
        settings.hasQuestionTimeLimit ? settings.questionTimeLimitSeconds : 0
    );
    const [testStartTime] = useState(Date.now());
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [testResults, setTestResults] = useState<TestResults | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isTestCompleted, setIsTestCompleted] = useState(false);

    const { setShowQuestionDetailModal, setSelectedQuestionDetailModal } = useContext(ModalContext);

    const [navigatorPage, setNavigatorPage] = useState(0);
    const [resultsPage, setResultsPage] = useState(0);
    const [resultsFilter, setResultsFilter] = useState('');
    const [loadedQuestions, setLoadedQuestions] = useState<Set<number>>(new Set([0]));
    const navigatorRef = useRef<HTMLDivElement>(null);

    const currentQuestion = useMemo(() => {
        // Lazy load current question if not already loaded
        if (!loadedQuestions.has(currentQuestionIndex)) {
            setLoadedQuestions(prev => new Set([...prev, currentQuestionIndex]));
        }
        return questions[currentQuestionIndex];
    }, [questions, currentQuestionIndex, loadedQuestions]);

    const progress = useMemo(() => ((currentQuestionIndex + 1) / questions.length) * 100, [currentQuestionIndex, questions.length]);

    // Add question type detection
    const currentQuestionTypeConfig = useMemo(() => {
        const questionType = currentQuestion?.questionType || detectQuestionType(currentQuestion?.choices || []);
        return getQuestionTypeConfig(questionType);
    }, [currentQuestion]);

    // Virtualized navigator range
    const navigatorRange = useMemo((): VirtualizedRange => {
        const start = navigatorPage * NAVIGATOR_PAGE_SIZE;
        const end = Math.min(start + NAVIGATOR_PAGE_SIZE, questions.length);
        return { start, end };
    }, [navigatorPage, questions.length]);

    // Virtualized navigator questions
    const visibleNavigatorQuestions = useMemo(() => {
        return questions.slice(navigatorRange.start, navigatorRange.end);
    }, [questions, navigatorRange]);

    // Filtered and paginated results
    const filteredResults = useMemo(() => {
        if (!testResults) return {
            results: [],
            total: 0,
            hasMore: false
        };

        let filtered = testResults.questionResults;

        if (resultsFilter) {
            const searchTerm = resultsFilter.toLowerCase();
            filtered = filtered.filter((result, index) =>
                result.question.toLowerCase().includes(searchTerm) ||
                result.selectedAnswer.toLowerCase().includes(searchTerm) ||
                result.correctAnswer.toLowerCase().includes(searchTerm) ||
                (index + 1).toString().includes(searchTerm)
            );
        }

        const start = resultsPage * RESULTS_PAGE_SIZE;
        const end = start + RESULTS_PAGE_SIZE;

        return {
            results: filtered.slice(start, end),
            total: filtered.length,
            hasMore: end < filtered.length
        };
    }, [testResults, resultsFilter, resultsPage]);

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Pre-load adjacent questions for smoother navigation
    const preloadAdjacentQuestions = useCallback(() => {
        const toLoad = new Set<number>();

        if (currentQuestionIndex > 0) toLoad.add(currentQuestionIndex - 1);
        if (currentQuestionIndex < questions.length - 1) toLoad.add(currentQuestionIndex + 1);

        for (let i = navigatorRange.start; i < navigatorRange.end; i++) {
            toLoad.add(i);
        }

        setLoadedQuestions(prev => new Set([...prev, ...toLoad]));
    }, [currentQuestionIndex, questions.length, navigatorRange]);

    useEffect(() => {
        const timer = setTimeout(preloadAdjacentQuestions, 100);
        return () => clearTimeout(timer);
    }, [preloadAdjacentQuestions]);

    // Reset test state when questions change (for retakes)
    useEffect(() => {
        setCurrentQuestionIndex(0);
        setAnswers({});
        setFlaggedQuestions(new Set());
        setQuestionTimes({});
        setShowResults(false);
        setTestResults(null);
        setIsPaused(false);
        setIsTestCompleted(false);
        setQuestionStartTime(Date.now());
        if (settings.hasTimeLimit) {
            setTimeLeft(settings.timeLimitMinutes * 60);
        }
        if (settings.hasQuestionTimeLimit) {
            setQuestionTimeLeft(settings.questionTimeLimitSeconds);
        }
    }, [questions, settings.hasTimeLimit, settings.timeLimitMinutes, settings.hasQuestionTimeLimit, settings.questionTimeLimitSeconds]);

    const handleTestComplete = useCallback(() => {
        if (isTestCompleted) return;

        setIsTestCompleted(true);

        const computeResults = () => {
            const totalTimeSpent = Date.now() - testStartTime;
            let correctAnswers = 0;

            const questionResults: QuestionResult[] = questions.map((question, index) => {
                const selectedAnswers = answers[index] || [];
                const correctChoices = question.choices?.filter(choice => choice.isCorrect) || [];
                const correctAnswerValues = correctChoices.map(choice => choice.value);
                const questionType = question.questionType || detectQuestionType(question.choices || []);
                const isCorrect = validateQuestionAnswers(selectedAnswers, correctAnswerValues, questionType);

                if (isCorrect) correctAnswers++;

                return {
                    questionId: question.id,
                    question: question.question,
                    selectedAnswer: selectedAnswers.join(', ') || t('revision.noAnswer'),
                    correctAnswer: correctAnswerValues.join(' | '),
                    isCorrect,
                    timeSpent: questionTimes[index] || 0
                };
            });

            const results: TestResults = {
                score: Math.round((correctAnswers / questions.length) * 100),
                totalQuestions: questions.length,
                correctAnswers,
                timeSpent: totalTimeSpent,
                questionResults,
                flaggedQuestions: Array.from(flaggedQuestions)
            };

            setTestResults(results);
            setShowResults(true);
            onTestComplete(results);
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(computeResults);
        } else {
            setTimeout(computeResults, 0);
        }
    }, [answers, questions, questionTimes, testStartTime, flaggedQuestions, onTestComplete, isTestCompleted, t]);

    const handleNextQuestion = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setQuestionStartTime(Date.now());
            if (settings.hasQuestionTimeLimit) {
                setQuestionTimeLeft(settings.questionTimeLimitSeconds);
            }
        } else {
            handleTestComplete();
        }
    }, [currentQuestionIndex, questions.length, settings.hasQuestionTimeLimit, settings.questionTimeLimitSeconds, handleTestComplete]);

    useEffect(() => {
        if (isPaused || isTestCompleted) return;

        const timers: NodeJS.Timeout[] = [];

        // Global timer
        if (settings.hasTimeLimit && timeLeft > 0) {
            const globalTimer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTestComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            timers.push(globalTimer);
        }

        // Question timer
        if (settings.hasQuestionTimeLimit && questionTimeLeft > 0) {
            const questionTimer = setInterval(() => {
                setQuestionTimeLeft(prev => {
                    if (prev <= 1) {
                        handleNextQuestion();
                        return settings.questionTimeLimitSeconds;
                    }
                    return prev - 1;
                });
            }, 1000);
            timers.push(questionTimer);
        }

        return () => timers.forEach(timer => clearInterval(timer));
    }, [
        timeLeft,
        questionTimeLeft,
        settings.hasTimeLimit,
        settings.hasQuestionTimeLimit,
        settings.questionTimeLimitSeconds,
        isPaused,
        isTestCompleted,
        handleTestComplete,
        handleNextQuestion
    ]);

    const handleAnswerSelect = useCallback((answer: string) => {
        const timeSpent = Date.now() - questionStartTime;
        setQuestionTimes(prev => ({ ...prev, [currentQuestionIndex]: timeSpent }));

        if (currentQuestionTypeConfig.allowMultipleSelection) {
            // Multiple selection logic
            setAnswers(prev => {
                const current = prev[currentQuestionIndex] || [];
                const isSelected = current.includes(answer);

                if (isSelected) {
                    // Remove if already selected
                    return {
                        ...prev,
                        [currentQuestionIndex]: current.filter(a => a !== answer)
                    };
                } else {
                    // Add if not selected
                    return {
                        ...prev,
                        [currentQuestionIndex]: [...current, answer]
                    };
                }
            });
        } else {
            // Single selection logic
            setAnswers(prev => ({ ...prev, [currentQuestionIndex]: [answer] }));
        }
    }, [questionStartTime, currentQuestionIndex, currentQuestionTypeConfig.allowMultipleSelection]);

    const handleInputChange = useCallback((value: string) => {
        const timeSpent = Date.now() - questionStartTime;
        setQuestionTimes(prev => ({ ...prev, [currentQuestionIndex]: timeSpent }));
        setInputAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: [value] }));
    }, [questionStartTime, currentQuestionIndex]);

    const handlePreviousQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setQuestionStartTime(Date.now());
            if (settings.hasQuestionTimeLimit) {
                setQuestionTimeLeft(settings.questionTimeLimitSeconds);
            }
        }
    }, [currentQuestionIndex, settings.hasQuestionTimeLimit, settings.questionTimeLimitSeconds]);

    const handlePauseToggle = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    const handleQuestionClick = useCallback((questionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            setSelectedQuestionDetailModal(question);
            setShowQuestionDetailModal(true);
        }
    }, [questions, setSelectedQuestionDetailModal, setShowQuestionDetailModal]);

    // Optimized navigation handlers
    const handleQuestionNavigation = useCallback((index: number) => {
        // Ensure target question is loaded
        if (!loadedQuestions.has(index)) {
            setLoadedQuestions(prev => new Set([...prev, index]));
        }

        setCurrentQuestionIndex(index);
        setQuestionStartTime(Date.now());
        if (settings.hasQuestionTimeLimit) {
            setQuestionTimeLeft(settings.questionTimeLimitSeconds);
        }

        const targetPage = Math.floor(index / NAVIGATOR_PAGE_SIZE);
        if (targetPage !== navigatorPage) {
            setNavigatorPage(targetPage);
        }
    }, [loadedQuestions, settings.hasQuestionTimeLimit, settings.questionTimeLimitSeconds, navigatorPage]);

    const handleNavigatorPageChange = useCallback((direction: 'prev' | 'next') => {
        const maxPage = Math.ceil(questions.length / NAVIGATOR_PAGE_SIZE) - 1;
        setNavigatorPage(prev => {
            if (direction === 'prev') return Math.max(0, prev - 1);
            return Math.min(maxPage, prev + 1);
        });
    }, [questions.length]);

    const handleResultsPageChange = useCallback((direction: 'prev' | 'next') => {
        setResultsPage(prev => {
            if (direction === 'prev') return Math.max(0, prev - 1);
            return prev + 1;
        });
    }, []);

    const handleFlagToggle = useCallback(() => {
        setFlaggedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(currentQuestionIndex)) {
                newSet.delete(currentQuestionIndex);
            } else {
                newSet.add(currentQuestionIndex);
            }
            return newSet;
        });
    }, [currentQuestionIndex]);

    // Calculate countdown values for the circular progress bar
    const countdownValues = useMemo(() => {
        if (settings.hasQuestionTimeLimit) {
            return {
                max: settings.questionTimeLimitSeconds,
                value: questionTimeLeft,
                label: `${questionTimeLeft}s`
            };
        } else if (settings.hasTimeLimit) {
            const totalSeconds = settings.timeLimitMinutes * 60;
            const progressPercentage = (timeLeft / totalSeconds) * 100;
            return {
                max: 100,
                value: Math.max(0, progressPercentage),
                label: formatTime(timeLeft)
            };
        }
        return {
            max: 100,
            value: 100,
            label: "∞"
        };
    }, [settings.hasQuestionTimeLimit, settings.hasTimeLimit, settings.questionTimeLimitSeconds, settings.timeLimitMinutes, questionTimeLeft, timeLeft, formatTime]);

    if (showResults && testResults) {
        return (
            <div className="space-y-6">
                <TestResultsCard
                    testResults={testResults}
                    answers={answers}
                    questionTimes={questionTimes}
                    timeLeft={timeLeft}
                    settings={settings}
                    onBackToSettings={onBackToSettings}
                    onRetakeTest={() => {
                        setShowResults(false);
                        onRetakeTest?.();
                    }}
                    formatTime={formatTime}
                />

                {testResults.flaggedQuestions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Flag className="h-5 w-5 text-amber-500" />
                                {t('revision.flaggedQuestions')} ({testResults.flaggedQuestions.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-10 gap-2">
                                {testResults.flaggedQuestions.map((questionIndex) => (
                                    <Tooltip key={questionIndex}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-8 h-8 p-0 border-amber-500 text-amber-600"
                                                onClick={() => handleQuestionClick(questions[questionIndex].id)}
                                            >
                                                {questionIndex + 1}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('revision.clickToReviewFlagged')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {settings.showCorrectAnswers && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{t('revision.reviewAnswers')}</span>
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder={t('revision.searchQuestions')}
                                        value={resultsFilter}
                                        onChange={(e) => {
                                            setResultsFilter(e.target.value);
                                            setResultsPage(0);
                                        }}
                                        className="w-64"
                                    />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {filteredResults.results.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    {resultsFilter ? t('revision.noQuestionsMatchSearch') : t('revision.noResultsToDisplay')}
                                </p>
                            ) : (
                                <>
                                    {/* Results list */}
                                    <div className="space-y-4">
                                        {filteredResults.results.map((result, index) => {
                                            const actualIndex = resultsPage * RESULTS_PAGE_SIZE + index;
                                            return (
                                                <div
                                                    key={actualIndex}
                                                    className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                                    onClick={() => handleQuestionClick(result.questionId)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex gap-1">
                                                            {result.isCorrect ? (
                                                                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-red-500 mt-1" />
                                                            )}
                                                            {testResults.flaggedQuestions.includes(index) && (
                                                                <Flag className="h-4 w-4 text-amber-500 mt-1" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium mb-2">
                                                                <TipTapViewer content={result.question} />
                                                            </div>
                                                            <div className="space-y-1 text-sm">
                                                                <p>
                                                                    <span className="font-medium">{t('revision.yourAnswer')}</span>{' '}
                                                                    <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                                                        {result.selectedAnswer || t('revision.noAnswer')}
                                                                    </span>
                                                                </p>
                                                                {!result.isCorrect && (
                                                                    <p>
                                                                        <span className="font-medium">{t('revision.correctAnswer')}</span>{' '}
                                                                        <span className="text-green-600">{result.correctAnswer}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Results pagination */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <p className="text-sm text-muted-foreground">
                                            {t('revision.showingResults', {
                                                start: resultsPage * RESULTS_PAGE_SIZE + 1,
                                                end: Math.min((resultsPage + 1) * RESULTS_PAGE_SIZE, filteredResults.total),
                                                total: filteredResults.total
                                            })}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleResultsPageChange('prev')}
                                                disabled={resultsPage === 0}
                                            >
                                                {t('common.previous')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleResultsPageChange('next')}
                                                disabled={!filteredResults.hasMore}
                                            >
                                                {t('common.next')}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Pause Dialog */}
            <Dialog open={isPaused} onOpenChange={setIsPaused}>
                <DialogContent className="w-96">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pause className="h-5 w-5" />
                            {t('revision.testPaused')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-center text-muted-foreground">
                            {t('revision.yourTestIsPaused')}
                        </p>
                        <div className="flex justify-center gap-2">
                            <Button onClick={handlePauseToggle} className="flex items-center gap-2">
                                <Play className="h-4 w-4" />
                                {t('revision.resumeTest')}
                            </Button>
                            <Button variant="outline" onClick={onBackToSettings}>
                                {t('revision.exitTest')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center p-6 space-y-4">
                            <AnimatedCircularProgressBar
                                max={countdownValues.max}
                                min={0}
                                value={countdownValues.value}
                                gaugePrimaryColor="rgb(79 70 229)"
                                gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                            />
                            <div className="text-center">
                                {flaggedQuestions.size > 0 && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Flag className="h-3 w-3" />
                                                {t('revision.flagged', { count: flaggedQuestions.size })}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('revision.youHaveFlaggedQuestions', { count: flaggedQuestions.size })}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                {settings.allowPause && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePauseToggle}
                                        className="flex items-center gap-2"
                                    >
                                        <Pause className="h-3 w-3" />
                                        {t('revision.pause')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Progress value={progress} className="flex-1" />
                            <span className="text-sm text-muted-foreground ml-4">
                                {t('revision.page')} {navigatorPage + 1} {t('revision.of')} {Math.ceil(questions.length / NAVIGATOR_PAGE_SIZE)}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Navigator pagination controls */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNavigatorPageChange('prev')}
                                    disabled={navigatorPage === 0}
                                >
                                    {t('revision.previousPage')}
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {t('revision.questions')} {navigatorRange.start + 1} - {navigatorRange.end}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNavigatorPageChange('next')}
                                    disabled={navigatorRange.end >= questions.length}
                                >
                                    {t('revision.nextPage')}
                                </Button>
                            </div>

                            {/* Virtualized question grid */}
                            <div ref={navigatorRef} className="grid grid-cols-10 gap-2">
                                {visibleNavigatorQuestions.map((_, localIndex) => {
                                    const globalIndex = navigatorRange.start + localIndex;
                                    return (
                                        <Tooltip key={globalIndex}>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant={
                                                        globalIndex === currentQuestionIndex
                                                            ? "default"
                                                            : (answers[globalIndex] && answers[globalIndex].length > 0)
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                    size="sm"
                                                    className="w-8 h-8 p-0 relative"
                                                    onClick={() => handleQuestionNavigation(globalIndex)}
                                                    disabled={!settings.allowFreeNavigation}
                                                >
                                                    {globalIndex + 1}
                                                    {flaggedQuestions.has(globalIndex) && (
                                                        <Flag className="h-2 w-2 absolute -top-1 -right-1 text-amber-500" />
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    {t('revision.questions')} {globalIndex + 1}
                                                    {(answers[globalIndex] && answers[globalIndex].length > 0) && t('revision.answered')}
                                                    {flaggedQuestions.has(globalIndex) && t('revision.flagged')}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Question Card */}
            <Card className="relative overflow-hidden">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handlePreviousQuestion}
                                disabled={currentQuestionIndex === 0 || !settings.allowFreeNavigation}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t('common.previous')}
                            </Button>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={flaggedQuestions.has(currentQuestionIndex) ? "default" : "outline"}
                                        size="sm"
                                        onClick={handleFlagToggle}
                                        className="flex items-center gap-2"
                                    >
                                        <Flag className={`h-4 w-4 ${flaggedQuestions.has(currentQuestionIndex)
                                            ? 'text-amber-500'
                                            : ''
                                            }`} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {flaggedQuestions.has(currentQuestionIndex)
                                            ? t('revision.removeFlagFromQuestion')
                                            : t('revision.flagQuestionForReview')
                                        }
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex gap-2">
                            {settings.allowFreeNavigation && (
                                <Button
                                    onClick={handleTestComplete}
                                    className="flex items-center gap-2"
                                >
                                    <Send />
                                    {t('revision.submit')}
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                onClick={handleNextQuestion}
                                disabled={(!answers[currentQuestionIndex] || answers[currentQuestionIndex].length === 0) && settings.hasQuestionTimeLimit}
                                className="flex items-center gap-2"
                            >
                                {currentQuestionIndex === questions.length - 1 ? t('revision.finish') : t('common.next')}
                                <ArrowRight />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <CardTitle>
                            <TipTapViewer content={currentQuestion?.question} />
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {t(currentQuestionTypeConfig.label)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                {t(currentQuestionTypeConfig.description)}
                            </Badge>
                        </div>
                    </div>

                    {currentQuestion?.tags && currentQuestion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {currentQuestion.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                        {currentQuestionTypeConfig.requiresInput ? (
                            // Input question rendering
                            <div className="space-y-4">
                                {currentQuestionTypeConfig.type === 'essay' ? (
                                    <Textarea
                                        placeholder={t('questionTypes.essay.description')}
                                        value={inputAnswers[currentQuestionIndex] || ''}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        rows={6}
                                        className="w-full text-lg p-4 resize-none"
                                    />
                                ) : (
                                    <Input
                                        placeholder={currentQuestionTypeConfig.type === 'numerical' ? t('questionTypes.numerical.description') : t('questionTypes.default.description')}
                                        value={inputAnswers[currentQuestionIndex] || ''}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        type="text"
                                        className="w-full text-lg p-4"
                                    />
                                )}
                            </div>
                        ) : (
                            // Multiple choice question rendering
                            currentQuestion?.choices?.map((choice, index) => {
                                const currentAnswers = answers[currentQuestionIndex] || [];
                                const isSelected = currentAnswers.includes(choice.value);

                                return (
                                    <Button
                                        key={index}
                                        variant={isSelected ? "default" : "outline"}
                                        className="w-full justify-start text-left h-auto p-4 whitespace-normal break-words"
                                        onClick={() => handleAnswerSelect(choice.value)}
                                    >
                                        <div className="flex items-start gap-2 w-full">
                                            <span className="font-medium shrink-0">{String.fromCharCode(65 + index)}.</span>
                                            <span className="flex-1 break-words">{choice.value}</span>
                                            {isSelected && currentQuestionTypeConfig.allowMultipleSelection && (
                                                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                            )}
                                        </div>
                                    </Button>
                                );
                            })
                        )}
                    </div>
                </CardContent>

                <BorderBeam duration={8} size={100} />
            </Card>
        </div>
    );
}
