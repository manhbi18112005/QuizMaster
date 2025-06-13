import React, { ChangeEvent, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FancyMultiSelect } from "@/components/fancy-multi-select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusCircle, Trash2, Check } from "lucide-react";
import { Question } from '@/types/quiz';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { Content } from "@tiptap/react";
import { Badge } from "@/components/ui/badge";
import { detectQuestionType, getQuestionTypeConfig } from "@/lib/question-types";


interface QuestionEditorPanelContentProps {
  selectedQuestion: Question | undefined;
  availableTags: string[];
  onQuestionDetailChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAddChoice: () => void;
  onRemoveChoice: (index: number) => void;
  onChoiceChange: (index: number, value: string) => void;
  onChoiceIsCorrectChange: (choiceIndex: number, isCorrect: boolean) => void;
  onTagsChange: (newTags: string[]) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

export const QuestionEditorPanelContent: React.FC<QuestionEditorPanelContentProps> = React.memo(({
  selectedQuestion,
  availableTags,
  onQuestionDetailChange,
  onAddChoice,
  onRemoveChoice,
  onChoiceChange,
  onChoiceIsCorrectChange,
  onTagsChange,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}) => {

  // Memoized question type detection for performance
  const questionTypeInfo = useMemo(() => {
    if (!selectedQuestion || !selectedQuestion.choices) {
      return null;
    }

    const detectedType = detectQuestionType(selectedQuestion.choices);
    const config = getQuestionTypeConfig(detectedType);

    return {
      type: detectedType,
      label: config.label,
      description: config.description
    };
  }, [selectedQuestion]);

  const handleCreatedAtChange = useCallback((date: Date | undefined) => {
    const syntheticEvent = {
      target: {
        name: 'createdAt',
        value: date ?? new Date()
      },
    } as unknown as ChangeEvent<HTMLInputElement>;
    onQuestionDetailChange(syntheticEvent);
  }, [onQuestionDetailChange]);

  const handleQuestionTextChange = useCallback((questionContent: Content) => {
    const valueToUpdate = typeof questionContent === 'string' ? questionContent : JSON.stringify(questionContent);
    const syntheticEvent = {
      target: {
        name: 'question',
        value: valueToUpdate,
      },
    } as unknown as ChangeEvent<HTMLTextAreaElement>;
    onQuestionDetailChange(syntheticEvent);
  }, [onQuestionDetailChange]);

  const handleNotesChange = useCallback((notesContent: Content) => {
    const valueToUpdate = typeof notesContent === 'string' ? notesContent : JSON.stringify(notesContent);
    const syntheticEvent = {
      target: {
        name: 'notes',
        value: valueToUpdate,
      },
    } as unknown as ChangeEvent<HTMLTextAreaElement>;
    onQuestionDetailChange(syntheticEvent);
  }, [onQuestionDetailChange]);

  const handleDifficultyChange = useCallback((value: string) => {
    onQuestionDetailChange({
      target: { name: 'difficulty', value }
    } as unknown as ChangeEvent<HTMLInputElement>);
  }, [onQuestionDetailChange]);

  if (!selectedQuestion) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a question to see its details or create a new one.</p>
      </div>
    );
  }

  // Convert string from selectedQuestion.createdAt to Date object for the picker
  let createdAtDate: Date | undefined = undefined;
  if (selectedQuestion.createdAt) {
    const parsedDate = new Date(selectedQuestion.createdAt);
    if (!isNaN(parsedDate.getTime())) {
      createdAtDate = parsedDate;
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <CardTitle className='text-sm text-muted-foreground'>{selectedQuestion.id}</CardTitle>
            {questionTypeInfo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs font-medium">
                    {questionTypeInfo.label}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{questionTypeInfo.description}</p>
                </TooltipContent>
              </Tooltip>
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
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <MinimalTiptapEditor
            key={`q-editor-${selectedQuestion.id}`}
            value={selectedQuestion.question}
            onChange={handleQuestionTextChange}
            output="html"
            placeholder="Enter the question text..."
            editorContentClassName="min-h-[80px] p-2 rounded-md"
            immediatelyRender={false}
          />
        </div>
        <div className="space-y-2">
          {selectedQuestion.choices.map((choice, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={choice.value}
                onChange={(e) => onChoiceChange(index, e.target.value)}
                placeholder={`Choice ${index + 1}`}
                className="flex-1"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (choice.value.trim() === "" && !choice.isCorrect) return; // Prevent marking empty new choice as correct
                      onChoiceIsCorrectChange(index, !choice.isCorrect);
                    }}
                    variant={choice.isCorrect ? "default" : "ghost"}
                    size="icon"
                    disabled={choice.value.trim() === "" && !choice.isCorrect}
                    className={
                      choice.isCorrect
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : ""
                    }
                  >
                    <Check
                      className={`h-4 w-4 ${choice.isCorrect ? "" : "text-green-600"
                        }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{choice.isCorrect ? "Unmark as correct" : "Mark as correct"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => onRemoveChoice(index)} variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove Choice</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
          {selectedQuestion.choices.length === 0 && <p className="text-sm text-muted-foreground">No choices yet. Click Add Choice below.</p>}
          <Button onClick={onAddChoice} variant="default" className="w-full mt-2">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Choice
          </Button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="questionTags" className="font-semibold">Assign Tags:</Label>
            <FancyMultiSelect
              value={selectedQuestion.tags}
              onChange={onTagsChange}
              availableOptions={availableTags}
              placeholder="Select or create tags..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="questionCategory" className="font-semibold">Category:</Label>
              <Input
                id="questionCategory"
                name="category"
                value={selectedQuestion.category || ""}
                onChange={onQuestionDetailChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="questionDifficulty" className="font-semibold">Difficulty:</Label>
              <Select
                value={selectedQuestion.difficulty || ""}
                onValueChange={handleDifficultyChange}
              >
                <SelectTrigger id="questionDifficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="questionCreatedAt" className="font-semibold">Created At:</Label>
            <DatetimePicker
              value={createdAtDate}
              onChange={handleCreatedAtChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Notes</h3>
          <MinimalTiptapEditor
            key={`notes-editor-${selectedQuestion.id}`}
            value={selectedQuestion.notes || ""}
            onChange={handleNotesChange}
            output="html"
            placeholder="Enter notes for the question..."
            editorContentClassName="min-h-[100px] p-2"
            immediatelyRender={false}
          />
        </div>
      </CardContent>
    </Card>
  );
});

QuestionEditorPanelContent.displayName = 'QuestionEditorPanelContent';