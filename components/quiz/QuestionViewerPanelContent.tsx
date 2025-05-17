import { FC } from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { Question } from '@/types/quiz';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { toast } from "sonner";
import { SafeContent } from '@/components/safecontent';

interface QuestionViewerPanelContentProps {
  selectedQuestion: Question | undefined;
}

export const QuestionViewerPanelContent: FC<QuestionViewerPanelContentProps> = ({
  selectedQuestion,
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
      toast.success("Copied to clipboard!"); // Changed
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy", { // Changed
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
        <CardTitle>
          <div
            className="p-2 prose dark:prose-invert max-w-full cursor-pointer"
            onClick={e => {
              const textToCopy = (e.currentTarget as HTMLElement).textContent || "";
              handleCopy(textToCopy);
            }}
            title="Click to copy question text"
          >
            <SafeContent content={selectedQuestion.question} />
          </div>
        </CardTitle>
        <div className="flex items-center space-x-2 pt-2">
          {selectedQuestion.category && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs dark:bg-blue-700 dark:text-blue-200">
              {selectedQuestion.category}
            </span>
          )}
          {selectedQuestion.difficulty && (
            <DifficultyBadge difficulty={selectedQuestion.difficulty} />
          )}
        </div>
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
                  <span className="flex-1">
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
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Notes</h3>
            <div
              className="min-h-[100px] p-2 prose dark:prose-invert max-w-full"
            >
              <SafeContent content={selectedQuestion.notes} />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <CardTitle className='text-sm text-muted-foreground'>{selectedQuestion.id} - {createdAtDateFormatted}</CardTitle>
      </CardFooter>
    </Card>
  );
};