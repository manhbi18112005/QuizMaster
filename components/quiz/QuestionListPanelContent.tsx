import React from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Question } from '@/types/quiz';
import { QuestionCard } from './QuestionCard';

interface QuestionListPanelContentProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onCardClick: (questionId: string) => void;
}

export const QuestionListPanelContent: React.FC<QuestionListPanelContentProps> = ({
  questions,
  selectedQuestionId,
  onCardClick,
}) => {
  return (
      <SortableContext
        items={questions.map(q => q.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex h-100 w-full flex-col gap-2.5 p-4">
          {questions.length === 0 && <p className="text-muted-foreground">No questions yet. Click create to add one.</p>}
          {questions.map(q => (
            <QuestionCard
              key={q.id}
              id={q.id}
              question={q}
              onClick={() => onCardClick(q.id)}
              isSelected={q.id === selectedQuestionId}
            />
          ))}
        </div>
      </SortableContext>
  );
};
