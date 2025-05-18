/* eslint-disable @typescript-eslint/no-unsafe-function-type,@typescript-eslint/no-explicit-any */
import { ChangeEvent, RefObject } from 'react';
import { Question, QuestionBank as CoreQuestionBank } from '@/types/quiz';
import { toast } from 'sonner';
import { DEFAULT_TAGS_DB } from '@/lib/db';
import { createDefaultQuestion } from './questionUtils';

export function handleImportClick(fileInputRef: RefObject<HTMLInputElement>) {
    fileInputRef.current?.click();
}

/**
 * Helper function to check if an item is a non-null object.
 * Assumes createDefaultQuestion will handle missing specific properties like id or question.
 *
 * @param q The item to check.
 * @returns {boolean} True if q is a non-null object, false otherwise.
 */
function isValidQuestionStructure(q: any): q is object {
    return q != null && typeof q === 'object';
}
/**
 * Type guard to check if the data is a CoreQuestionBank
 *
 * @param data
 * @returns {boolean}
 */
function isCoreQuestionBank(data: any): data is CoreQuestionBank {
    return (
        data &&
        typeof data === 'object' &&
        'id' in data &&
        'name' in data &&
        'questions' in data &&
        Array.isArray(data.questions)
    );
}

export function readFileAndParse(
    event: ChangeEvent<HTMLInputElement>,
    onSuccess: (parsedData: Question[] | CoreQuestionBank) => void,
    onFinally: () => void
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

                if (isCoreQuestionBank(parsedJson)) {
                    if (parsedJson.questions.every(isValidQuestionStructure)) {
                        const questionsWithDefaults = parsedJson.questions.map(createDefaultQuestion);
                        onSuccess({ ...parsedJson, questions: questionsWithDefaults });
                    } else {
                        toast.error("Invalid QuestionBank format: questions array contains invalid items.");
                    }
                }
                else if (
                    Array.isArray(parsedJson) &&
                    parsedJson.every(isValidQuestionStructure)
                ) {
                    const questionsWithDefaults = parsedJson.map(createDefaultQuestion);
                    onSuccess(questionsWithDefaults);
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

export function executeImport(
    importedQuestions: Question[],
    setQuestions: Function,
    setSelectedQuestionId: Function,
    setAvailableTags: Function
) {
    setQuestions(importedQuestions);
    setSelectedQuestionId(null);
    const allTagsFromImport = new Set<string>();
    importedQuestions.forEach((q) =>
        q.tags?.forEach((t) => allTagsFromImport.add(t))
    );

    setAvailableTags((prevTags: string[]) => {
        const combinedTags = new Set(prevTags);
        DEFAULT_TAGS_DB.forEach(tag => combinedTags.add(tag));
        allTagsFromImport.forEach(tag => combinedTags.add(tag));
        return Array.from(combinedTags);
    });

    toast.success("Questions imported successfully.");
}
