"use client";

import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Flag, ChevronDown, ChevronUp, ExternalLink, RotateCcw } from "lucide-react";
import { Question } from "@/types/quiz";
import { QuestionViewerPanelContent } from "../quiz/QuestionViewerPanelContent";
import { TipTapViewer } from "../tiptap-viewer";
import { useRouter } from 'next/navigation';
import { BANKPREFIX_URL } from "@/lib/client-constants";
import useWorkspace from "@/helpers/swr/use-workspace";

interface PracticeComponentProps {
    questions: Question[];
}


interface AnswerFeedback {
    isCorrect: boolean;
    selectedAnswer: string;
    correctAnswer: string;
    notes?: string;
}

const NAVIGATOR_PAGE_SIZE = 50; // Show 50 questions per page in navigator

// Memoized sub-components for better performance
const QuestionNavigatorButton = memo(({
    index,
    isActive,
    hasAnswer,
    feedback,
    isFlagged,
    onClick
}: {
    index: number;
    isActive: boolean;
    hasAnswer: boolean;
    feedback?: AnswerFeedback;
    isFlagged: boolean;
    onClick: (index: number) => void;
}) => {
    const handleClick = useCallback(() => onClick(index), [index, onClick]);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={
                        isActive
                            ? "default"
                            : feedback?.isCorrect
                                ? "secondary"
                                : hasAnswer && !feedback?.isCorrect
                                    ? "destructive"
                                    : "outline"
                    }
                    size="sm"
                    className="w-8 h-8 p-0 relative"
                    onClick={handleClick}
                >
                    {index + 1}
                    {isFlagged && (
                        <Flag className="h-2 w-2 absolute -top-1 -right-1 text-amber-500" />
                    )}
                    {feedback && (
                        <div className="absolute -bottom-1 -right-1">
                            {feedback.isCorrect ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                                <XCircle className="h-3 w-3 text-red-500" />
                            )}
                        </div>
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>
                    Question {index + 1}
                    {hasAnswer && ` (${feedback?.isCorrect ? 'Correct' : 'Incorrect'})`}
                    {isFlagged && " (Flagged)"}
                </p>
            </TooltipContent>
        </Tooltip>
    );
});

QuestionNavigatorButton.displayName = "QuestionNavigatorButton";

export function PracticeComponent({
    questions,
}: PracticeComponentProps) {
    // Consolidated state for better performance
    const [practiceState, setPracticeState] = useState({
        currentQuestionIndex: 0,
        navigatorPage: 0,
        isNavigatorCollapsed: false,
    });

    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [answerFeedback, setAnswerFeedback] = useState<Record<number, AnswerFeedback>>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [selectedQuestionDetail] = useState<Question | null>(null);
    const [showQuestionDialog, setShowQuestionDialog] = useState(false);
    const [loadedQuestions, setLoadedQuestions] = useState<Set<number>>(new Set([0]));

    const navigatorRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { workspace } = useWorkspace();

    // Destructure for cleaner code
    const { currentQuestionIndex, navigatorPage, isNavigatorCollapsed } = practiceState;

    // Memoized current question with lazy loading
    const currentQuestion = useMemo(() => {
        if (!loadedQuestions.has(currentQuestionIndex)) {
            setLoadedQuestions(prev => new Set([...prev, currentQuestionIndex]));
        }
        return questions[currentQuestionIndex];
    }, [questions, currentQuestionIndex, loadedQuestions]);

    // Optimized calculations with fewer dependencies
    const derivedState = useMemo(() => {
        const answeredCount = Object.keys(answers).length;
        const correctCount = Object.values(answerFeedback).filter(f => f.isCorrect).length;
        const incorrectCount = Object.values(answerFeedback).filter(f => !f.isCorrect).length;

        const progress = (answeredCount / questions.length) * 100;
        const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

        const currentFeedback = answerFeedback[currentQuestionIndex];
        const currentSelectedAnswer = selectedAnswers[currentQuestionIndex];
        const hasSubmittedAnswer = !!answers[currentQuestionIndex];

        // Navigator range
        const navigatorStart = navigatorPage * NAVIGATOR_PAGE_SIZE;
        const navigatorEnd = Math.min(navigatorStart + NAVIGATOR_PAGE_SIZE, questions.length);

        return {
            progress,
            stats: {
                answered: answeredCount,
                correct: correctCount,
                incorrect: incorrectCount,
                unanswered: questions.length - answeredCount,
                accuracy
            },
            currentFeedback,
            currentSelectedAnswer,
            hasSubmittedAnswer,
            navigatorRange: { start: navigatorStart, end: navigatorEnd }
        };
    }, [answers, answerFeedback, questions.length, currentQuestionIndex, selectedAnswers, navigatorPage]);

    // Memoized visible navigator questions
    const visibleNavigatorQuestions = useMemo(() => {
        return questions.slice(derivedState.navigatorRange.start, derivedState.navigatorRange.end);
    }, [questions, derivedState.navigatorRange]);

    // Optimized preloading with debouncing
    const preloadAdjacentQuestions = useCallback(() => {
        const toLoad = new Set<number>();

        // Load adjacent questions
        if (currentQuestionIndex > 0) toLoad.add(currentQuestionIndex - 1);
        if (currentQuestionIndex < questions.length - 1) toLoad.add(currentQuestionIndex + 1);

        // Load visible navigator questions
        for (let i = derivedState.navigatorRange.start; i < derivedState.navigatorRange.end; i++) {
            toLoad.add(i);
        }

        setLoadedQuestions(prev => {
            const hasNewItems = [...toLoad].some(item => !prev.has(item));
            return hasNewItems ? new Set([...prev, ...toLoad]) : prev;
        });
    }, [currentQuestionIndex, questions.length, derivedState.navigatorRange]);

    useEffect(() => {
        const timer = setTimeout(preloadAdjacentQuestions, 100);
        return () => clearTimeout(timer);
    }, [preloadAdjacentQuestions]);

    // Optimized event handlers
    const handleAnswerSelect = useCallback((answer: string) => {
        if (!derivedState.hasSubmittedAnswer) {
            setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
        }
    }, [currentQuestionIndex, derivedState.hasSubmittedAnswer]);

    const handleSubmitAnswer = useCallback(() => {
        const { currentSelectedAnswer } = derivedState;
        if (!currentSelectedAnswer) return;

        const correctChoice = currentQuestion.choices?.find(choice => choice.isCorrect);
        const correctAnswer = correctChoice?.value || '';
        const isCorrect = currentSelectedAnswer === correctAnswer;

        // Batch state updates
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: currentSelectedAnswer }));
        setAnswerFeedback(prev => ({
            ...prev,
            [currentQuestionIndex]: {
                isCorrect,
                selectedAnswer: currentSelectedAnswer,
                correctAnswer,
                notes: currentQuestion.notes
            }
        }));
    }, [currentQuestion.choices, currentQuestion.notes, currentQuestionIndex, derivedState]);

    // Consolidated navigation handler
    const handleNavigation = useCallback((direction: 'prev' | 'next' | number) => {
        let newIndex: number;

        if (typeof direction === 'number') {
            newIndex = direction;
        } else if (direction === 'prev') {
            newIndex = Math.max(0, currentQuestionIndex - 1);
        } else {
            newIndex = Math.min(questions.length - 1, currentQuestionIndex + 1);
        }

        if (newIndex === currentQuestionIndex) return;

        // Ensure target question is loaded
        if (!loadedQuestions.has(newIndex)) {
            setLoadedQuestions(prev => new Set([...prev, newIndex]));
        }

        // Update navigator page if needed
        const targetPage = Math.floor(newIndex / NAVIGATOR_PAGE_SIZE);

        setPracticeState(prev => ({
            ...prev,
            currentQuestionIndex: newIndex,
            navigatorPage: targetPage !== navigatorPage ? targetPage : prev.navigatorPage
        }));
    }, [currentQuestionIndex, questions.length, loadedQuestions, navigatorPage]);

    // Optimized navigator page handler
    const handleNavigatorPageChange = useCallback((direction: 'prev' | 'next') => {
        const maxPage = Math.ceil(questions.length / NAVIGATOR_PAGE_SIZE) - 1;
        setPracticeState(prev => ({
            ...prev,
            navigatorPage: direction === 'prev'
                ? Math.max(0, prev.navigatorPage - 1)
                : Math.min(maxPage, prev.navigatorPage + 1)
        }));
    }, [questions.length]);

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

    const handleNavigatorToggle = useCallback(() => {
        setPracticeState(prev => ({ ...prev, isNavigatorCollapsed: !prev.isNavigatorCollapsed }));
    }, []);

    const handleResetProgress = useCallback(() => {
        setAnswers({});
        setSelectedAnswers({});
        setAnswerFeedback({});
        setFlaggedQuestions(new Set());
        setPracticeState(prev => ({ ...prev, currentQuestionIndex: 0, navigatorPage: 0 }));
    }, []);

    const handleRedirectToQuestion = useCallback((question: Question) => {
        router.push(`${BANKPREFIX_URL}/${workspace?.id}?q=${question.id}&tab=edit`);
    }, [router, workspace?.id]);

    // Memoized question navigation handler
    const questionNavigationHandler = useCallback((index: number) => {
        handleNavigation(index);
    }, [handleNavigation]);

    return (
        <div className="space-y-6">
            {/* Statistics Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Practice Progress</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetProgress}
                                className="flex items-center gap-2"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset Progress
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{derivedState.stats.answered}</div>
                            <div className="text-sm text-muted-foreground">Answered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{derivedState.stats.correct}</div>
                            <div className="text-sm text-muted-foreground">Correct</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{derivedState.stats.incorrect}</div>
                            <div className="text-sm text-muted-foreground">Incorrect</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{derivedState.stats.unanswered}</div>
                            <div className="text-sm text-muted-foreground">Remaining</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{derivedState.stats.accuracy}%</div>
                            <div className="text-sm text-muted-foreground">Accuracy</div>
                        </div>
                    </div>
                    <Progress value={derivedState.progress} className="w-full" />
                </CardContent>
            </Card>

            {/* Question Navigator */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Question Navigator</span>
                            <Badge variant="outline">{currentQuestionIndex + 1} of {questions.length}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Page {navigatorPage + 1} of {Math.ceil(questions.length / NAVIGATOR_PAGE_SIZE)}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleNavigatorToggle}
                                className="flex items-center gap-1"
                            >
                                {isNavigatorCollapsed ? (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        <span className="text-sm">Show</span>
                                    </>
                                ) : (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        <span className="text-sm">Hide</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                {!isNavigatorCollapsed && (
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNavigatorPageChange('prev')}
                                    disabled={navigatorPage === 0}
                                >
                                    Previous Page
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Questions {derivedState.navigatorRange.start + 1} - {derivedState.navigatorRange.end}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNavigatorPageChange('next')}
                                    disabled={derivedState.navigatorRange.end >= questions.length}
                                >
                                    Next Page
                                </Button>
                            </div>

                            <div ref={navigatorRef} className="grid grid-cols-10 gap-2">
                                {visibleNavigatorQuestions.map((_, localIndex) => {
                                    const globalIndex = derivedState.navigatorRange.start + localIndex;
                                    return (
                                        <QuestionNavigatorButton
                                            key={globalIndex}
                                            index={globalIndex}
                                            isActive={globalIndex === currentQuestionIndex}
                                            hasAnswer={!!answers[globalIndex]}
                                            feedback={answerFeedback[globalIndex]}
                                            isFlagged={flaggedQuestions.has(globalIndex)}
                                            onClick={questionNavigationHandler}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleNavigation('prev')}
                                disabled={currentQuestionIndex === 0}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Previous
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
                                            ? 'Remove flag from this question'
                                            : 'Flag this question for review'
                                        }
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex gap-2">
                            {!derivedState.hasSubmittedAnswer && derivedState.currentSelectedAnswer && (
                                <Button
                                    onClick={handleSubmitAnswer}
                                    className="flex items-center gap-2"
                                >
                                    Submit Answer
                                </Button>
                            )}
                            <Button
                                onClick={() => handleNavigation('next')}
                                disabled={currentQuestionIndex === questions.length - 1}
                                className="flex items-center gap-2"
                            >
                                Next
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            <TipTapViewer content={currentQuestion?.question} />
                        </CardTitle>
                        {derivedState.currentFeedback && (
                            <div className="flex items-center gap-2">
                                {derivedState.currentFeedback.isCorrect ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-red-500" />
                                )}
                            </div>
                        )}
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
                        {currentQuestion?.choices?.map((choice, index) => {
                            const isSelected = derivedState.hasSubmittedAnswer
                                ? answers[currentQuestionIndex] === choice.value
                                : derivedState.currentSelectedAnswer === choice.value;
                            const isCorrect = choice.isCorrect;

                            let variant: "default" | "outline" | "destructive" | "secondary" = "outline";
                            let className = "w-full justify-start text-left h-auto p-4 whitespace-normal break-words";

                            if (derivedState.hasSubmittedAnswer) {
                                if (isCorrect) {
                                    variant = "outline";
                                    className += " border-green-500 bg-green-100 hover:bg-green-200 text-green-800 dark:border-green-400 dark:bg-green-900/50 dark:hover:bg-green-800/50 dark:text-green-200";
                                } else if (isSelected && !isCorrect) {
                                    variant = "outline";
                                    className += " border-red-500 bg-red-100 hover:bg-red-200 text-red-800 dark:border-red-400 dark:bg-red-900/50 dark:hover:bg-red-800/50 dark:text-red-200";
                                }
                            } else if (isSelected) {
                                variant = "default";
                            }

                            return (
                                <Button
                                    key={index}
                                    variant={variant}
                                    className={className}
                                    onClick={() => handleAnswerSelect(choice.value)}
                                    disabled={derivedState.hasSubmittedAnswer}
                                >
                                    <div className="flex items-start gap-2 w-full">
                                        <span className="font-medium shrink-0">{String.fromCharCode(65 + index)}.</span>
                                        <span className="flex-1 break-words">{choice.value}</span>
                                        {derivedState.hasSubmittedAnswer && isCorrect && (
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                                        )}
                                        {derivedState.hasSubmittedAnswer && isSelected && !isCorrect && (
                                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                                        )}
                                    </div>
                                </Button>
                            );
                        })}
                    </div>

                    {/* Feedback Section */}
                    {derivedState.currentFeedback?.notes && (
                        <Alert className="mt-4">
                            <AlertDescription>
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">Explanation:</div>
                                    <TipTapViewer content={derivedState.currentFeedback.notes} />
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Question Detail Dialog */}
            <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            Question Details
                            {selectedQuestionDetail && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRedirectToQuestion(selectedQuestionDetail)}
                                    className="flex items-center gap-2"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Edit Question
                                </Button>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedQuestionDetail && (
                        <QuestionViewerPanelContent
                            selectedQuestion={selectedQuestionDetail}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
