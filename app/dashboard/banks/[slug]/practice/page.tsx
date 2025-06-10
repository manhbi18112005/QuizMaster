"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { MaxWidthWrapper } from "@/components/ui/max-width-wrapper";
import { getQuestionBankById, DbQuestionBank } from "@/lib/db";
import { Question } from "@/types/quiz";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from 'sonner';
import { SmoothScrollProvider } from "@/components/smooth-scroll/SmoothScrollProvider";
import { PracticeComponent } from "@/components/practice/practice-component";
import { BANKPREFIX_URL } from "@/lib/client-constants";

export default function PracticePage() {
    const params = useParams();
    const { slug } = params as { slug: string };

    const [currentBank, setCurrentBank] = useState<DbQuestionBank | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const dbBank = await getQuestionBankById(slug);

                if (dbBank) {
                    setCurrentBank(dbBank);
                    setQuestions(dbBank.questions || []);
                } else {
                    toast.error(`Question bank with ID "${slug}" not found.`);
                }
            } catch (error) {
                console.error(error, "Failed to load bank data from DB");
                toast.error("Failed to load bank data.");
            }
        }
        loadData();
    }, [slug]);

    const prepareQuestionsForPractice = (): Question[] => {
        // Early return if no questions available
        if (!questions || questions.length === 0) {
            return [];
        }

        const filteredQuestions = questions
            // Filter out questions with no choices
            .filter(q => q.choices && Array.isArray(q.choices) && q.choices.length > 0)
            // Normalize questions and ensure correct answer exists
            .map(question => {
                const normalizedQuestion = {
                    ...question,
                    // Create options array from choices for backward compatibility
                    options: question.choices.map(choice => choice.value),
                    // Find correct answer from choices
                    correctAnswer: question.choices.find(choice => choice.isCorrect)?.value || question.choices[0]?.value
                };

                // If no correct answer found, mark first choice as correct
                if (!question.choices.some(choice => choice.isCorrect)) {
                    console.warn(`Question "${question.id}" has no correct answer, marking first choice as correct`);
                }

                return normalizedQuestion;
            });

        return filteredQuestions;
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

    const revisionQuestions = prepareQuestionsForPractice();

    if (revisionQuestions.length === 0) {
        return (
            <ContentLayout title="Practice" description={`Revise questions from ${currentBank.name}`}>
                <MaxWidthWrapper>
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-gray-600">No questions available for revision.</p>
                    </div>
                </MaxWidthWrapper>
            </ContentLayout>
        );
    }

    return (
        <>
            <SmoothScrollProvider />
            <ContentLayout titleBackButtonLink={`${BANKPREFIX_URL}/${currentBank.id}`} title="Practice" description={`Revise questions from ${currentBank.name}`}>
                <MaxWidthWrapper>
                    <PracticeComponent
                        questions={revisionQuestions}
                    />
                </MaxWidthWrapper>
            </ContentLayout>
        </>
    );
}