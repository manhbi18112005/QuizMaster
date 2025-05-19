import { FC, useRef, useEffect } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Question } from '@/types/quiz';
import { QuestionCard } from './QuestionCard';

import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

interface QuestionListPanelContentProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onCardClick: (questionId: string) => void;
}

export const QuestionListPanelContent: FC<QuestionListPanelContentProps> = ({
  questions,
  selectedQuestionId,
  onCardClick,
}) => {
  const itemRefs = useRef(new Map<string, HTMLDivElement | null>());

  useEffect(() => {
    if (selectedQuestionId) {
      const node = itemRefs.current.get(selectedQuestionId);
      if (node) {
        node.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedQuestionId, questions]);

  return (
    <SortableContext
      items={questions.map(q => q.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className="flex h-100 w-full flex-col gap-2.5 p-3">
        <SimpleBar>
          {questions.length === 0 && <p className="text-muted-foreground">No questions yet. Click create to add one.</p>}
          {questions.map(q => (
            <div
              key={q.id}
              ref={el => {
                if (el) {
                  itemRefs.current.set(q.id, el);
                } else {
                  itemRefs.current.delete(q.id);
                }
              }}
            >
              <QuestionCard
                // key={q.id} // Key is now on the parent div
                id={q.id}
                question={q}
                onClick={() => onCardClick(q.id)}
                isSelected={q.id === selectedQuestionId}
              />
            </div>
          ))}
        </SimpleBar>
      </div>
    </SortableContext>
  );
};
