import { FC, useRef, useEffect, memo } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Question } from '@/types/quiz';
import { QuestionCard } from './QuestionCard';
import { useTranslation } from "@/hooks/use-translation";
interface QuestionListPanelContentProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onCardClick: (questionId: string) => void;
}

export const QuestionListPanelContent: FC<QuestionListPanelContentProps> = memo(({
  questions,
  selectedQuestionId,
  onCardClick,
}) => {
  const { t } = useTranslation();
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
      {questions.length === 0 && <p className="text-muted-foreground">{t("quiz.questionList.noQuestions")}</p>}
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
            id={q.id}
            question={q}
            onItemClick={onCardClick}
            isSelected={q.id === selectedQuestionId}
          />
        </div>
      ))}
    </SortableContext>
  );
});

QuestionListPanelContent.displayName = 'QuestionListPanelContent';
