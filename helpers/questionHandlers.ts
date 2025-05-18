/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { ChangeEvent } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Question } from '@/types/quiz';
import { toast } from 'sonner';
import { DEFAULT_TAGS_DB } from '@/lib/db';
import { createDefaultQuestion } from './questionUtils';

export function handleCreateQuestion(
  setQuestions: Function,
  setSelectedQuestionId: Function,
  questions: Question[]
) {
  const newQuestion = createDefaultQuestion({
    question: `New Question ${questions.length + 1}`
  });
  setQuestions((prev: Question[]) => [...prev, newQuestion]);
  setSelectedQuestionId(newQuestion.id);
}

export function handleExportData(questions: Question[]) {
  if (questions.length === 0) {
    toast.error("No questions to export.");
    return;
  }
  const dataStr = JSON.stringify(questions, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "questions.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Question data has been exported as questions.json");
}

export function executeDeleteQuestion(
  selectedId: string,
  setQuestions: Function,
  setSelectedQuestionId: Function
) {
  setQuestions((prev: Question[]) =>
    prev.filter((q) => q.id !== selectedId)
  );
  setSelectedQuestionId(null);
  toast.success("Question deleted.");
}

export function executeClearAllData(
  setQuestions: Function,
  setAvailableTags: Function,
  setSelectedQuestionId: Function
) {
  setQuestions([]);
  setAvailableTags([...DEFAULT_TAGS_DB]);
  setSelectedQuestionId(null);
  toast.success("All data has been cleared.");
}

export function handleCardClick(
  questionId: string,
  setSelectedQuestionId: Function
) {
  setSelectedQuestionId(questionId);
}

export function handleDragEnd(
  event: DragEndEvent,
  setQuestions: Function
) {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    setQuestions((items: Question[]) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }
}

export function handleQuestionDetailChange(
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  selectedId: string | null,
  setQuestions: Function
) {
  if (!selectedId) return;
  const { name, value } = e.target;
  setQuestions((prev: Question[]) =>
    prev.map((q) =>
      q.id === selectedId ? { ...q, [name]: value } : q
    )
  );
}

export function updateQuestion(
  id: string,
  updates: Partial<Question>,
  setQuestions: Function
) {
  setQuestions((prev: Question[]) =>
    prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
  );
}

export function handleChoiceChange(
  index: number,
  value: string,
  selectedId: string | null,
  questions: Question[],
  setQuestions: Function
) {
  if (!selectedId) return;
  const q = questions.find((x) => x.id === selectedId);
  if (!q) return;

  const newChoices = q.choices.map((choice, i) => {
    if (i === index) {
      return { ...choice, value: value };
    }
    return choice;
  });

  // If the choice text becomes empty, and it was marked as correct,
  // it might be desirable to also mark it as incorrect.
  // For now, we only update the value. Correctness is handled separately.
  // If an empty choice should not be correct, that logic would go here or in validation.

  updateQuestion(selectedId, { choices: newChoices }, setQuestions);
}

export function handleAddChoice(
  selectedId: string | null,
  questions: Question[],
  setQuestions: Function
) {
  if (!selectedId) return;
  const q = questions.find((x) => x.id === selectedId);
  if (!q) return;
  updateQuestion(
    selectedId,
    { choices: [...q.choices, { value: "", isCorrect: false }] },
    setQuestions
  );
}

export function handleRemoveChoice(
  index: number,
  selectedId: string | null,
  questions: Question[],
  setQuestions: Function
) {
  if (!selectedId) return;
  const q = questions.find((x) => x.id === selectedId);
  if (!q) return;

  const newChoices = q.choices.filter((_, i) => i !== index);
  updateQuestion(selectedId, { choices: newChoices }, setQuestions);
}

export function handleChoiceIsCorrectChange(
  choiceIndex: number,
  isCorrect: boolean,
  selectedId: string | null,
  questions: Question[],
  setQuestions: Function
) {
  if (!selectedId) return;
  const q = questions.find((x) => x.id === selectedId);
  if (!q) return;

  const newChoices = q.choices.map((choice, i) => {
    if (i === choiceIndex) {
      return { ...choice, isCorrect: isCorrect };
    }
    return choice;
  });
  updateQuestion(selectedId, { choices: newChoices }, setQuestions);
}

export function handleTagsChange(
  newTags: string[],
  selectedId: string | null,
  setQuestions: Function,
  availableTags: string[],
  setAvailableTags: Function
) {
  if (!selectedId) return;
  updateQuestion(selectedId, { tags: newTags }, setQuestions);
  newTags.forEach((t) => {
    if (!availableTags.includes(t)) {
      setAvailableTags((prev: string[]) => [...prev, t]);
    }
  });
}

export function handleSearchTermChange(
  value: string,
  setSearchTerm: Function
) {
  setSearchTerm(value);
}
