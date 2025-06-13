"use client";
import { QuestionSearchModule } from '@/components/search/QuestionSearchModule';
import { useState, useEffect } from 'react';
import { Question } from '@/types/quiz';
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { QuestionViewerPanelContent } from '@/components/quiz/QuestionViewerPanelContent';
import { getAllQuestionBanks, DbQuestionBank } from "@/lib/db";
import { toast } from "sonner";
import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
    const [selectedQuestionDetail, setSelectedQuestionDetail] = useState<Question | undefined>(undefined);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [questionBankMap, setQuestionBankMap] = useState<Map<string, { bankId: string; bankName: string; }>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function initialFetch() {
            setIsLoading(true);
            try {
                const banks: DbQuestionBank[] = await getAllQuestionBanks();

                if (banks.length === 0) {
                    setAllQuestions([]);
                    setQuestionBankMap(new Map());
                    return;
                }

                const questionBankMap = new Map<string, { bankId: string; bankName: string }>();
                const allQuestions = banks.flatMap(bank =>
                    (bank.questions || []).map(question => {
                        questionBankMap.set(question.id, { bankId: bank.id, bankName: bank.name });
                        return question;
                    })
                );

                // Batch state updates to avoid multiple re-renders
                setAllQuestions(allQuestions);
                setQuestionBankMap(questionBankMap);
            } catch (error) {
                console.error(error, "Failed to load questions for global search");
                toast.error("Failed to load questions for search.");
            } finally {
                setIsLoading(false);
            }
        }
        initialFetch();
    }, []);

    const handleGlobalQuestionSelect = (data: { question: Question; bankId: string; bankName: string }) => {
        setSelectedQuestionDetail(data.question);
    };

    const handleCreateBank = () => {
        router.push('/dashboard?create=true');
    };

    return (
        <ContentLayout title="Global Search">
            <div className="flex flex-col items-start justify-start w-full h-full p-4 md:p-6">
                {!isLoading && allQuestions.length === 0 ? (
                    <div className="w-full">
                        <EmptyStateCard onCreateBank={handleCreateBank} />
                    </div>
                ) : (
                    <>
                        <QuestionSearchModule
                            onQuestionSelect={handleGlobalQuestionSelect}
                            questions={allQuestions}
                            questionBankMap={questionBankMap}
                            isLoading={isLoading}
                        />
                        <div className="w-full mt-4">
                            {selectedQuestionDetail && (
                                <QuestionViewerPanelContent
                                    selectedQuestion={selectedQuestionDetail}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </ContentLayout>
    );
}