import { useRouter } from "next/navigation";
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useMemo,
    useState,
} from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Question } from "@/types/quiz";
import { QuestionViewerPanelContent } from "../quiz/QuestionViewerPanelContent";
import { BANKPREFIX_URL } from "@/lib/client-constants";
import useWorkspace from "@/helpers/swr/use-workspace";

function QuestionDetailModalHelper({
    showQuestionDetailModal,
    setShowQuestionDetailModal,
    selectedQuestion,
}: {
    showQuestionDetailModal: boolean;
    setShowQuestionDetailModal: Dispatch<SetStateAction<boolean>>;
    selectedQuestion: Question | null;
}) {
    const router = useRouter();
    const { workspace } = useWorkspace();

    const handleRedirectToQuestion = useCallback((question: Question) => {
        router.push(`${BANKPREFIX_URL}/${workspace?.id}?q=${question.id}&tab=edit`);
    }, [router, workspace?.id]);

    return (
        <Dialog open={showQuestionDetailModal} onOpenChange={setShowQuestionDetailModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        {selectedQuestion && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowQuestionDetailModal(false);
                                    handleRedirectToQuestion(selectedQuestion)
                                }}
                                className="flex items-center gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Edit Question
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>
                {selectedQuestion && (
                    <QuestionViewerPanelContent
                        selectedQuestion={selectedQuestion}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

export function useQuestionDetailModal() {
    const [showQuestionDetailModal, setShowQuestionDetailModal] = useState(false);
    const [selectedQuestion, setSelectedQuestionDetailModal] = useState<Question | null>(null);

    const QuestionDetailModal = useCallback(() => {
        return (
            <QuestionDetailModalHelper
                showQuestionDetailModal={showQuestionDetailModal}
                setShowQuestionDetailModal={setShowQuestionDetailModal}
                selectedQuestion={selectedQuestion}
            />
        );
    }, [showQuestionDetailModal, setShowQuestionDetailModal, selectedQuestion]);

    return useMemo(
        () => ({
            setShowQuestionDetailModal,
            QuestionDetailModal,
            setSelectedQuestionDetailModal
        }),
        [setShowQuestionDetailModal, QuestionDetailModal, setSelectedQuestionDetailModal],
    );
}
