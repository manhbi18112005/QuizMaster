/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { ChangeEvent } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Question, QuestionBank as CoreQuestionBank } from '@/types/quiz'; // Added CoreQuestionBank
import { toast } from 'sonner';
import { DEFAULT_TAGS_DB } from '@/lib/db'; // Import centralized default tags

export function handleCreateQuestion(
  setQuestions: Function,
  setSelectedQuestionId: Function,
  questions: Question[]
) {
  const newQuestion: Question = {
    id: `question-${Date.now()}`,
    question: `New Question ${questions.length + 1}`,
    choices: ["A", "B"],
    answers: ["A"],
    tags: [],
    notes: "New note",
    category: "",
    difficulty: "easy",
    createdAt: new Date(),
  };
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

// Renamed and refactored: Core logic for deleting a question
export function executeDeleteQuestion(
  selectedId: string, // Assume selectedId is validated before calling
  setQuestions: Function,
  setSelectedQuestionId: Function
) {
  setQuestions((prev: Question[]) =>
    prev.filter((q) => q.id !== selectedId)
  );
  setSelectedQuestionId(null);
  toast.success("Question deleted.");
}

export function handleImportClick(fileInputRef: React.RefObject<HTMLInputElement>) {
  fileInputRef.current?.click();
}

// Refactored: Reads and parses the file, then calls a success callback with data
export function readFileAndParse(
  event: ChangeEvent<HTMLInputElement>,
  onSuccess: (parsedData: Question[] | CoreQuestionBank) => void, // Updated type
  onFinally: () => void // To reset file input
) {
  const file = event.target.files?.[0];
  if (!file) {
    onFinally();
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target?.result;
      if (typeof text === "string") {
        const parsedJson = JSON.parse(text);

        // Check if it's a CoreQuestionBank object
        if (
          parsedJson &&
          typeof parsedJson === 'object' &&
          'id' in parsedJson &&
          'name' in parsedJson &&
          'questions' in parsedJson &&
          Array.isArray(parsedJson.questions)
        ) {
          // Basic validation for questions within the bank
          const bank = parsedJson as CoreQuestionBank;
          if (bank.questions.every((q: object) => 'id' in q && 'question' in q)) {
            onSuccess(bank);
          } else {
            toast.error("Invalid QuestionBank format: questions array contains invalid items.");
          }
        }
        // Check if it's an array of Question objects
        else if (
          Array.isArray(parsedJson) &&
          parsedJson.every((q) => 'id' in q && 'question' in q)
        ) {
          onSuccess(parsedJson as Question[]);
        } else {
          toast.error("Invalid file format. Expected an array of questions or a question bank object.");
        }
      }
    } catch (err) {
      console.error("Error importing data:", err);
      toast.error("Error importing data. Check the console for details.");
    } finally {
      onFinally();
    }
  };
  reader.onerror = () => {
    toast.error("Error reading file.");
    onFinally();
  };
  reader.readAsText(file);
}

// New: Core logic for importing questions after confirmation
export function executeImport(
  importedQuestions: Question[],
  setQuestions: Function,
  setSelectedQuestionId: Function,
  setAvailableTags: Function
) {
  setQuestions(importedQuestions);
  setSelectedQuestionId(null);
  const allTags = new Set<string>();
  importedQuestions.forEach((q) =>
    q.tags?.forEach((t) => allTags.add(t))
  );
  setAvailableTags((prev: string[]) =>
    Array.from(new Set([...prev, ...DEFAULT_TAGS_DB, ...allTags])) // Use DEFAULT_TAGS_DB
  );
  toast.success("Questions imported successfully.");
}


// Renamed and refactored: Core logic for clearing all data
export function executeClearAllData(
  setQuestions: Function,
  setAvailableTags: Function,
  setSelectedQuestionId: Function
) {
  setQuestions([]);
  setAvailableTags([...DEFAULT_TAGS_DB]); // Use DEFAULT_TAGS_DB
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
  const oldVal = q.choices[index];
  const newChoices = [...q.choices];
  newChoices[index] = value;
  let newAnswers = [...q.answers];
  if (q.answers.includes(oldVal)) {
    newAnswers = newAnswers.map((ans) =>
      ans === oldVal ? value : ans
    );
    if (value.trim() === "") {
      newAnswers = newAnswers.filter((ans) => ans !== value);
    }
  }
  updateQuestion(selectedId, { choices: newChoices, answers: newAnswers }, setQuestions);
}

export function handleAddChoice(
  selectedId: string | null,
  questions: Question[],
  setQuestions: Function
) {
  if (!selectedId) return;
  const q = questions.find((x) => x.id === selectedId);
  if (!q) return;
  updateQuestion(selectedId, { choices: [...q.choices, ""] }, setQuestions);
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
  const removeVal = q.choices[index];
  const newChoices = q.choices.filter((_, i) => i !== index);
  const newAnswers = q.answers.filter((ans) => ans !== removeVal);
  updateQuestion(selectedId, { choices: newChoices, answers: newAnswers }, setQuestions);
}

export function handleAnswersChange(
  newAnswers: string[],
  selectedId: string | null,
  setQuestions: Function
) {
  if (!selectedId) return;
  updateQuestion(selectedId, { answers: newAnswers }, setQuestions);
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
