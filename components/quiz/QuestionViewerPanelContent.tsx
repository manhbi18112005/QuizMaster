import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { Question } from '@/types/quiz';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { toast } from "sonner";
import { SafeContent } from '@/components/safecontent';
import { Blockquote } from '@/components/ui/block-quote';
import { TipTapViewer } from '@/components/tiptap-viewer';
import { Button } from '@/components/ui/button';

interface QuestionViewerPanelContentProps {
  selectedQuestion: Question | undefined;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

export const QuestionViewerPanelContent: FC<QuestionViewerPanelContentProps> = ({
  selectedQuestion,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}) => {
  if (!selectedQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a question to see its details.</p>
      </div>
    );
  }

  const handleCopy = async (text: string | undefined) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy", {
        description: "Could not copy text to clipboard.",
      });
    }
  };

  let createdAtDateFormatted: string = "N/A";
  if (selectedQuestion.createdAt) {
    const parsedDate = new Date(selectedQuestion.createdAt);
    if (!isNaN(parsedDate.getTime())) {
      createdAtDateFormatted = parsedDate.toLocaleString();
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex-grow">
            <CardTitle className='text-sm text-muted-foreground'>{selectedQuestion.id} - {createdAtDateFormatted}</CardTitle>
            <div className="flex items-center space-x-2 pt-1 sm:pt-2">
              {selectedQuestion.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs dark:bg-blue-700 dark:text-blue-200">
                  {selectedQuestion.category}
                </span>
              )}
              {selectedQuestion.difficulty && (
                <DifficultyBadge difficulty={selectedQuestion.difficulty} />
              )}
            </div>
          </div>
          <div className="space-x-2 flex-shrink-0 self-end sm:self-center">
            {onPrevious && onNext && (
              <>
                <Button onClick={onPrevious} disabled={!canGoPrevious} variant="outline">
                  Previous
                </Button>
                <Button onClick={onNext} disabled={!canGoNext} variant="outline">
                  Next
                </Button>
              </>
            )}
          </div>
        </div>
        <CardTitle>
          <div
            className="p-2 prose dark:prose-invert max-w-full cursor-pointer"
            onClick={e => {
              const textToCopy = (e.currentTarget as HTMLElement).textContent || "";
              handleCopy(textToCopy);
            }}
            title="Click to copy question text"
          >
            <TipTapViewer content={selectedQuestion.question} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {selectedQuestion.choices.length > 0 ? (
            selectedQuestion.choices.map((choice, index) => {
              const isCorrect = choice.isCorrect;
              const baseClasses = "flex items-center space-x-2 p-2 border rounded";
              const correctnessClasses = isCorrect
                ? "bg-green-100 dark:bg-green-800"
                : "bg-red-100 dark:bg-red-800";

              return (
                <div
                  key={index}
                  className={`${baseClasses} ${correctnessClasses} cursor-pointer`}
                  onClick={() => handleCopy(choice.value)}
                  title="Click to copy choice text"
                >
                  <span className="flex-1 font-semibold">
                    <SafeContent content={choice.value} />
                  </span>
                  {isCorrect && (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No choices for this question.</p>
          )}
        </div>

        <div className="space-y-4">
          {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
            <div className="space-y-1">
              <Label htmlFor="questionTags" className="font-semibold">Tags:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedQuestion.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedQuestion.notes && (
          <Blockquote>
            <TipTapViewer content={selectedQuestion.notes} />
          </Blockquote>
        )}
      </CardContent>
    </Card>
  );
};