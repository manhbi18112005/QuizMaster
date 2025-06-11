"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { MaxWidthWrapper } from "@/components/ui/max-width-wrapper";
import { getQuestionBankById, DbQuestionBank, getAvailableTags, DEFAULT_TAGS_DB, saveTestResult } from "@/lib/db";
import { Question } from "@/types/quiz";
import { TestResults } from "@/types/test-results";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { TestSettings } from "@/components/revision/revision-settings";
import { TestSettingsType } from "@/types/test-settings";
import { TestComponent } from "@/components/revision/revision-component";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BANKPREFIX_URL } from "@/lib/client-constants";
import { detectQuestionType } from "@/lib/question-types";

export default function RevisionPage() {
    const params = useParams();
    const { slug } = params as { slug: string };

    const [currentBank, setCurrentBank] = useState<DbQuestionBank | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([...DEFAULT_TAGS_DB]);
    const [showSettings, setShowSettings] = useState(true);
    const [testSettings, setTestSettings] = useState<TestSettingsType | null>(null);
    const [testQuestions, setTestQuestions] = useState<Question[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const [dbBank, dbTags] = await Promise.all([
                    getQuestionBankById(slug),
                    getAvailableTags(),
                ]);

                if (dbBank) {
                    setCurrentBank(dbBank);
                    setQuestions(dbBank.questions || []);
                } else {
                    toast.error(`Question bank with ID "${slug}" not found.`);
                    // Potentially redirect or show a "not found" message
                }
                setAvailableTags(dbTags);
            } catch (error) {
                console.error(error, "Failed to load bank data from DB");
                toast.error("Failed to load bank data.");
            }
        }
        loadData();
    }, [slug]);

    const handleStartTest = (settings: TestSettingsType) => {
        // Validate that we have questions after filtering
        const preparedQuestions = prepareQuestionsForTest(settings);

        if (preparedQuestions.length === 0) {
            toast.error("No questions match your filter criteria. Please adjust your settings.");
            return;
        }

        if (preparedQuestions.length < settings.totalQuestions) {
            toast.warning(`Only ${preparedQuestions.length} questions available with your filters. Test will use all available questions.`);
        }

        setTestSettings(settings);
        setTestQuestions(preparedQuestions);
        setShowSettings(false);
        toast.success("Test started! Good luck!");
    };

    const handleRetakeTest = () => {
        if (!testSettings) return;

        // Generate new questions with the same settings
        const preparedQuestions = prepareQuestionsForTest(testSettings);

        if (preparedQuestions.length === 0) {
            toast.error("No questions match your filter criteria. Please adjust your settings.");
            return;
        }

        setTestQuestions(preparedQuestions);
        toast.info("Retaking test with new questions.");
    };

    const handleTestComplete = async (results: TestResults) => {
        if (!currentBank || !testSettings) return;

        try {
            // Save test result to database
            await saveTestResult({
                questionBankId: currentBank.id,
                questionBankName: currentBank.name,
                totalQuestions: results.totalQuestions,
                correctAnswers: results.correctAnswers,
                score: results.score,
                timeSpent: results.timeSpent || 0,
                testSettings: testSettings,
                questionResults: results.questionResults || [],
            });

            toast.success(`Test completed! Score: ${results.score}% - Result saved successfully.`);
        } catch (error) {
            console.error('Failed to save test result:', error);
            toast.error(`Test completed! Score: ${results.score}% - Failed to save result.`);
        }
    };

    const handleBackToSettings = () => {
        setShowSettings(true);
        setTestSettings(null);
    };

    const prepareQuestionsForTest = (settings: TestSettingsType): Question[] => {
        // Early return if no questions available
        if (!questions || questions.length === 0) {
            return [];
        }

        let filteredQuestions = questions
            // Filter out questions with no choices
            .filter(q => q.choices && Array.isArray(q.choices) && q.choices.length > 0)
            // Normalize questions and ensure correct answer exists
            .map(question => {
                const correctChoices = question.choices.filter(choice => choice.isCorrect);
                const questionType = detectQuestionType(question.choices);

                const normalizedQuestion = {
                    ...question,
                    // Add question type
                    questionType,
                    // Create options array from choices for backward compatibility
                    options: question.choices.map(choice => choice.value),
                    // Collect all correct answers
                    correctAnswer: correctChoices.length > 0
                        ? correctChoices.map(choice => choice.value).join('|')
                        : question.choices[0]?.value,
                    // Add array of correct answers for easier processing
                    correctAnswers: correctChoices.length > 0
                        ? correctChoices.map(choice => choice.value)
                        : [question.choices[0]?.value]
                };

                // If no correct answer found, mark first choice as correct
                if (correctChoices.length === 0) {
                    console.warn(`Question "${question.id}" has no correct answer, marking first choice as correct`);
                }

                return normalizedQuestion;
            });

        // Apply tag filtering if enabled
        if (settings.useTagFilter && settings.selectedTags.length > 0) {
            filteredQuestions = filteredQuestions.filter(q =>
                q.tags && Array.isArray(q.tags) &&
                q.tags.some(tag => settings.selectedTags.includes(tag))
            );
        }

        // Apply difficulty filtering
        if (settings.difficultyFilter && settings.difficultyFilter !== 'all') {
            filteredQuestions = filteredQuestions.filter(q =>
                q.difficulty === settings.difficultyFilter
            );
        }

        // Shuffle questions if enabled
        if (settings.shuffleQuestions) {
            filteredQuestions = [...filteredQuestions].sort(() => Math.random() - 0.5);
        }

        // Shuffle answer options for each question if enabled
        if (settings.shuffleAnswers) {
            filteredQuestions = filteredQuestions.map(question => {
                // Shuffle choices while maintaining isCorrect flags
                const shuffledChoices = [...question.choices].sort(() => Math.random() - 0.5);
                const correctChoices = shuffledChoices.filter(choice => choice.isCorrect);

                return {
                    ...question,
                    choices: shuffledChoices,
                    options: shuffledChoices.map(choice => choice.value),
                    correctAnswer: correctChoices.length > 0
                        ? correctChoices.map(choice => choice.value).join('|')
                        : shuffledChoices[0]?.value,
                    correctAnswers: correctChoices.length > 0
                        ? correctChoices.map(choice => choice.value)
                        : [shuffledChoices[0]?.value]
                };
            });
        }

        // Limit to requested number of questions
        return filteredQuestions.slice(0, Math.min(settings.totalQuestions, filteredQuestions.length));
    };

    if (!currentBank) {
        return (
            <ContentLayout>
                <MaxWidthWrapper>
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-gray-600">Loading question bank...</p>
                    </div>
                </MaxWidthWrapper>
            </ContentLayout>
        );
    }

    return (
        <>
            {showSettings ? (
                <ContentLayout titleBackButtonLink={`${BANKPREFIX_URL}/${currentBank.id}`} title="Test Configurator" description="Configure your revision test settings before starting">
                    <MaxWidthWrapper>
                        <TestSettings
                            availableTags={availableTags}
                            maxAvailableQuestions={questions.length}
                            onStartTest={handleStartTest}
                        />
                    </MaxWidthWrapper>
                </ContentLayout>
            ) : (
                <ContentLayout titleControls={
                    <Button variant="outline" onClick={handleBackToSettings} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Settings
                    </Button>
                } title="Testing" description={`${testSettings?.totalQuestions} questions from ${currentBank.name}`}>
                    <MaxWidthWrapper>
                        <TestComponent
                            questions={testQuestions}
                            settings={testSettings!}
                            onTestComplete={handleTestComplete}
                            onBackToSettings={handleBackToSettings}
                            onRetakeTest={handleRetakeTest}
                        />
                    </MaxWidthWrapper>
                </ContentLayout>
            )}
        </>
    );
}