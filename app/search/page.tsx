"use client";
import { GlobalSearchCommand } from '@/components/search/GlobalSearchCommand';
import { useState } from 'react';
import { Question } from '@/types/quiz';
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { QuestionViewerPanelContent } from '@/components/quiz/QuestionViewerPanelContent';

export default function SearchPage() {
    const [selectedQuestionDetail, setSelectedQuestionDetail] = useState<Question | undefined>(undefined);
    const handleGlobalQuestionSelect = (data: { question: Question; bankId: string; bankName: string }) => {
        setSelectedQuestionDetail(data.question);
    };
    return (
        <ContentLayout title="Global Search">
            <div className="flex flex-col items-start justify-start w-full h-full p-4 md:p-6">
                <GlobalSearchCommand onQuestionSelect={handleGlobalQuestionSelect} />
                <div className="w-full mt-4">
                    {selectedQuestionDetail && (
                        <QuestionViewerPanelContent
                            selectedQuestion={selectedQuestionDetail}
                        />
                    )}
                </div>
            </div>
        </ContentLayout>
    );
}