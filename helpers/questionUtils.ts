import { Question, QuestionAnswer } from '@/types/quiz';
import { v4 as uuidv4 } from 'uuid';

const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'] as const;
const DEFAULT_CHOICES: QuestionAnswer[] = [
    { value: "A", isCorrect: true },
    { value: "B", isCorrect: false },
];

export function createDefaultQuestion(partialData: Partial<Question> = {}): Question {
    const now = new Date();

    const getFinalChoices = (): QuestionAnswer[] => {
        if (!partialData.choices || !Array.isArray(partialData.choices) || partialData.choices.length === 0) {
            return DEFAULT_CHOICES;
        }

        const processedChoices = partialData.choices
            .map(choice => ({
                value: String(choice.value ?? ""), // Ensure value is a string
                isCorrect: Boolean(choice.isCorrect ?? false), // Ensure isCorrect is a boolean
            }))
            .filter(choice => choice.value !== "" || choice.isCorrect); // Keep if value is not empty OR it's marked as correct

        return processedChoices.length > 0 ? processedChoices : DEFAULT_CHOICES;
    };

    const getFinalCreatedAt = (): Date => {
        if (partialData.createdAt) {
            if (partialData.createdAt instanceof Date) {
                return partialData.createdAt;
            }
            // Attempt to parse if it's a string or number
            const parsedDate = new Date(partialData.createdAt);
            // If parsing results in a valid date, use it; otherwise, fallback to now
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
        }
        return now;
    };

    const finalChoices = getFinalChoices();
    const finalCreatedAt = getFinalCreatedAt();

    const finalDifficulty = (partialData.difficulty && DIFFICULTY_OPTIONS.includes(partialData.difficulty))
        ? partialData.difficulty
        : 'easy' as Question['difficulty'];

    return {
        id: partialData.id ?? uuidv4(),
        question: partialData.question ?? "New Question",
        choices: finalChoices,
        tags: partialData.tags ?? [],
        notes: partialData.notes ?? "",
        category: partialData.category ?? "",
        difficulty: finalDifficulty,
        createdAt: finalCreatedAt,
    };
}
