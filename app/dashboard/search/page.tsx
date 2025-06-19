"use client";

import { QuestionSearchModule } from '@/components/search/QuestionSearchModule';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Question } from '@/types/quiz';
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { QuestionViewerPanelContent } from '@/components/quiz/QuestionViewerPanelContent';
import { getAllQuestionBanks, DbQuestionBank } from "@/lib/db";
import { toast } from "sonner";
import { EmptyStateCard } from '@/components/dashboard/EmptyStateCard';
import { useRouter } from 'next/navigation';
import { useTranslation } from "@/hooks/use-translation";

export default function SearchPage() {
    const { t } = useTranslation();
    const [selectedQuestionDetail, setSelectedQuestionDetail] = useState<Question | undefined>(undefined);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [questionBankMap, setQuestionBankMap] = useState<Map<string, { bankId: string; bankName: string; }>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const memoizedQuestionBankMap = useMemo(() => questionBankMap, [questionBankMap]);
    const memoizedAllQuestions = useMemo(() => allQuestions, [allQuestions]);

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

                const newQuestionBankMap = new Map<string, { bankId: string; bankName: string }>();
                const newAllQuestions: Question[] = [];

                for (const bank of banks) {
                    if (bank.questions) {
                        for (const question of bank.questions) {
                            newQuestionBankMap.set(question.id, { bankId: bank.id, bankName: bank.name });
                            newAllQuestions.push(question);
                        }
                    }
                }

                // Single state updates to avoid multiple re-renders
                setQuestionBankMap(newQuestionBankMap);
                setAllQuestions(newAllQuestions);
            } catch (error) {
                console.error(error, "Failed to load questions for global search");
                toast.error(t("search.failedToLoad"));
            } finally {
                setIsLoading(false);
            }
        }
        initialFetch();
    }, [t]);

    const handleGlobalQuestionSelect = useCallback((data: { question: Question; bankId: string; bankName: string }) => {
        setSelectedQuestionDetail(data.question);
    }, []);

    const handleCreateBank = useCallback(() => {
        router.push('/dashboard?create=true');
    }, [router]);

    return (
        <ContentLayout title={t("search.globalSearch")}>
            <div className="flex flex-col items-start justify-start w-full h-full p-4 md:p-6">
                {!isLoading && allQuestions.length === 0 ? (
                    <div className="w-full">
                        <EmptyStateCard onCreateBank={handleCreateBank} />
                    </div>
                ) : (
                    <>
                        <QuestionSearchModule
                            onQuestionSelect={handleGlobalQuestionSelect}
                            questions={memoizedAllQuestions}
                            questionBankMap={memoizedQuestionBankMap}
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