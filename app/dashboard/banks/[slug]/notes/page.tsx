"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { SafeContent } from "@/components/safecontent";
import { MaxWidthWrapper } from "@/components/ui/max-width-wrapper";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuestionViewerPanelContent } from "@/components/quiz/QuestionViewerPanelContent";
import { FileText, ExternalLink } from "lucide-react";
import useWorkspace from "@/helpers/swr/use-workspace";
import { useRouter } from "next/navigation";
import { isEmpty } from "lodash";
import { useState, useEffect } from "react";
import { Question } from "@/types/quiz";
import { BANKPREFIX_URL } from "@/lib/client-constants";
import { TracingBeam } from "@/components/ui/tracing-beam";

export default function NotesPage() {
    const { workspace, loading } = useWorkspace();
    const router = useRouter();
    const [showQuestionDialog, setShowQuestionDialog] = useState(false);
    const [selectedQuestionDetail, setSelectedQuestionDetail] = useState(null as Question | null);

    useEffect(() => {
        if (!loading && !workspace) {
            router.push("/dashboard");
        }
    }, [workspace, loading, router]);

    if (loading || !workspace) {
        return null;
    }

    const questionsWithNotes = workspace.questions.filter(question => !isEmpty(question.notes));

    const handleViewQuestion = (question: Question) => {
        setSelectedQuestionDetail(question);
        setShowQuestionDialog(true);
    };

    const handleRedirectToQuestion = (question: Question) => {
        router.push(`${BANKPREFIX_URL}/${workspace.id}?q=${question.id}&tab=edit`);
    };

    if (questionsWithNotes.length === 0) {
        return (
            <ContentLayout title={`Notes - ${workspace.name}`} description="View and manage your question notes">
                <MaxWidthWrapper>
                    <Card className="border-dashed border-2 border-muted-foreground/25">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                <FileText className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="mt-6 text-xl font-semibold">No notes yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                                Start adding notes to your questions to keep track of important information and insights.
                            </p>
                        </CardContent>
                    </Card>
                </MaxWidthWrapper>
            </ContentLayout>
        )
    }

    return (
        <>
            <ContentLayout titleBackButtonLink={`${BANKPREFIX_URL}/${workspace.id}`} title={`Question Notes (${questionsWithNotes.length}) - ${workspace.name}`} description="Review your annotated questions and important insights">
                <MaxWidthWrapper>
                    <div className="space-y-8">

                        <Separator />

                        <TracingBeam className="mx-auto py-4">
                            <div className="space-y-6">
                                {questionsWithNotes.map((q, index) => (
                                    <Card key={index} onClick={() => handleViewQuestion(q)} className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary/60">
                                        <CardContent className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-semibold">
                                            <SafeContent className="font-medium text-xl" content={q.notes} />
                                        </CardContent>
                                        <CardFooter className="flex items-center gap-4 border-t border-muted-foreground/20 pt-4">
                                            <SafeContent className="font-normal text-foreground/80 text-sm flex-1" content={q.question} />
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TracingBeam>
                    </div>

                    {/* Dialog remains unchanged */}
                    <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
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
                </MaxWidthWrapper>
            </ContentLayout>
        </>
    )
}