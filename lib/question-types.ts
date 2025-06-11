import { isEmpty, toLower, trim } from 'lodash';

/**
 * Enumeration of supported question types in the quiz system.
 */
export enum QuestionType {
    SINGLE_CHOICE = 'single_choice',
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE = 'true_false',
    NUMERICAL = 'numerical',
    ESSAY = 'essay',
}

/**
 * Configuration interface for question types.
 */
export interface QuestionTypeConfig {
    readonly type: QuestionType;
    readonly label: string;
    readonly description: string;
    readonly allowMultipleSelection: boolean;
    readonly requiresInput: boolean;
    readonly minChoices: number;
    readonly maxChoices?: number;
}

/**
 * Configuration mapping for all question types.
 */
export const QUESTION_TYPE_CONFIGS: Readonly<Record<QuestionType, QuestionTypeConfig>> = {
    [QuestionType.SINGLE_CHOICE]: {
        type: QuestionType.SINGLE_CHOICE,
        label: 'Single Choice',
        description: 'Select one correct answer',
        allowMultipleSelection: false,
        requiresInput: false,
        minChoices: 2,
        maxChoices: 10,
    },
    [QuestionType.MULTIPLE_CHOICE]: {
        type: QuestionType.MULTIPLE_CHOICE,
        label: 'Multiple Choice',
        description: 'Select one or more correct answers',
        allowMultipleSelection: true,
        requiresInput: false,
        minChoices: 2,
        maxChoices: 10,
    },
    [QuestionType.TRUE_FALSE]: {
        type: QuestionType.TRUE_FALSE,
        label: 'True/False',
        description: 'Select true or false',
        allowMultipleSelection: false,
        requiresInput: false,
        minChoices: 2,
        maxChoices: 2,
    },
    [QuestionType.NUMERICAL]: {
        type: QuestionType.NUMERICAL,
        label: 'Numerical',
        description: 'Enter a numerical answer',
        allowMultipleSelection: false,
        requiresInput: true,
        minChoices: 1,
        maxChoices: 1,
    },
    [QuestionType.ESSAY]: {
        type: QuestionType.ESSAY,
        label: 'Essay',
        description: 'Write a detailed answer',
        allowMultipleSelection: false,
        requiresInput: true,
        minChoices: 0,
        maxChoices: 1,
    },
} as const;

/** Compiled regex patterns for numerical validation. */
const NUMERICAL_PATTERNS = {
    number: /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/,
    fraction: /^\d+\/\d+$/,
    percentage: /^\d+\s*%$/,
} as const;

/** Tolerance for numerical comparison. */
const NUMERICAL_TOLERANCE = 1e-10;

/** Pre-computed sets for true/false choice validation. */
const TRUE_FALSE_CHOICES = {
    true: new Set(['true', 't', 'yes', 'y', '1', 'correct', 'right', "đúng"]),
    false: new Set(['false', 'f', 'no', 'n', '0', 'incorrect', 'wrong', "sai"]),
} as const;

/**
 * Normalizes a string by trimming whitespace and converting to lowercase.
 */
function normalizeString(str: string): string {
    return toLower(trim(str));
}

/**
 * Checks if a value represents a numerical answer.
 */
function isNumericalValue(value: string): boolean {
    const normalized = value.trim();
    return Object.values(NUMERICAL_PATTERNS).some(pattern => pattern.test(normalized));
}

/**
 * Determines if choices represent a true/false question.
 */
function isTrueFalseChoice(choices: ReadonlyArray<{ readonly value: string }>): boolean {
    if (choices.length !== 2) {
        return false;
    }

    const normalizedValues = choices.map(choice => normalizeString(choice.value));
    const hasTrueValue = normalizedValues.some(value => TRUE_FALSE_CHOICES.true.has(value));
    const hasFalseValue = normalizedValues.some(value => TRUE_FALSE_CHOICES.false.has(value));

    return hasTrueValue && hasFalseValue;
}

/**
 * Converts a string value to its boolean representation for true/false questions.
 */
function getTrueFalseValue(value: string): boolean | null {
    const normalized = normalizeString(value);

    if (TRUE_FALSE_CHOICES.true.has(normalized)) {
        return true;
    }

    if (TRUE_FALSE_CHOICES.false.has(normalized)) {
        return false;
    }

    return null;
}

/**
 * Retrieves the configuration for a specific question type.
 */
export function getQuestionTypeConfig(type: QuestionType): QuestionTypeConfig {
    return QUESTION_TYPE_CONFIGS[type];
}

/**
 * Automatically detects the question type based on provided choices.
 */
export function detectQuestionType(
    choices: ReadonlyArray<{ readonly value: string; readonly isCorrect: boolean }>
): QuestionType {
    if (isEmpty(choices)) {
        return QuestionType.ESSAY;
    }

    if (isTrueFalseChoice(choices)) {
        return QuestionType.TRUE_FALSE;
    }

    if (choices.length === 1 && choices[0].isCorrect) {
        return isNumericalValue(choices[0].value) ? QuestionType.NUMERICAL : QuestionType.ESSAY;
    }

    const correctCount = choices.filter(choice => choice.isCorrect).length;
    return correctCount > 1 ? QuestionType.MULTIPLE_CHOICE : QuestionType.SINGLE_CHOICE;
}

/**
 * Validates user answers against correct answers for a specific question type.
 */
export function validateQuestionAnswers(
    selectedAnswers: ReadonlyArray<string>,
    correctAnswers: ReadonlyArray<string>,
    questionType: QuestionType
): boolean {
    if (isEmpty(selectedAnswers)) {
        return false;
    }

    const config = getQuestionTypeConfig(questionType);

    if (config.requiresInput) {
        return validateInputAnswer(selectedAnswers[0], correctAnswers, questionType);
    }

    if (!config.allowMultipleSelection) {
        return selectedAnswers.length === 1 && correctAnswers.includes(selectedAnswers[0]);
    }

    const selectedSet = new Set(selectedAnswers);
    const correctSet = new Set(correctAnswers);

    return (
        selectedSet.size === correctSet.size &&
        [...selectedSet].every(answer => correctSet.has(answer))
    );
}

/**
 * Validates input-based answers (numerical, essay, true/false input).
 */
function validateInputAnswer(
    userInput: string,
    correctAnswers: ReadonlyArray<string>,
    questionType: QuestionType
): boolean {
    const normalizedInput = trim(userInput);

    if (isEmpty(normalizedInput)) {
        return false;
    }

    switch (questionType) {
        case QuestionType.TRUE_FALSE:
            return validateTrueFalseAnswer(normalizedInput, correctAnswers);
        case QuestionType.NUMERICAL:
            return validateNumericalAnswer(normalizedInput, correctAnswers);
        case QuestionType.ESSAY:
            return validateEssayAnswer(normalizedInput, correctAnswers);
        default:
            return validateExactMatch(normalizedInput, correctAnswers);
    }
}

/**
 * Validates true/false answers with flexible input recognition.
 */
function validateTrueFalseAnswer(
    userInput: string,
    correctAnswers: ReadonlyArray<string>
): boolean {
    const userValue = getTrueFalseValue(userInput);

    if (userValue === null) {
        return false;
    }

    return correctAnswers.some(correct => {
        const correctValue = getTrueFalseValue(correct);
        return correctValue !== null && userValue === correctValue;
    });
}

/**
 * Validates numerical answers with tolerance for floating-point precision.
 */
function validateNumericalAnswer(
    userInput: string,
    correctAnswers: ReadonlyArray<string>
): boolean {
    const userNumber = parseFloat(userInput);

    if (isNaN(userNumber)) {
        return validateExactMatch(userInput, correctAnswers);
    }

    return correctAnswers.some(correct => {
        const correctNumber = parseFloat(trim(correct));
        return !isNaN(correctNumber) && Math.abs(userNumber - correctNumber) < NUMERICAL_TOLERANCE;
    });
}

/**
 * Validates essay answers with flexible matching strategies.
 */
function validateEssayAnswer(
    userInput: string,
    correctAnswers: ReadonlyArray<string>
): boolean {
    const lowerInput = normalizeString(userInput);

    if (isEmpty(correctAnswers)) {
        return false;
    }

    return correctAnswers.some(correct => {
        const lowerCorrect = normalizeString(correct);
        return (
            lowerInput === lowerCorrect ||
            lowerInput.includes(lowerCorrect) ||
            lowerCorrect.includes(lowerInput)
        );
    });
}

/**
 * Validates answers using exact string matching (case-insensitive).
 */
function validateExactMatch(
    userInput: string,
    correctAnswers: ReadonlyArray<string>
): boolean {
    const lowerInput = normalizeString(userInput);
    return correctAnswers.some(correct => normalizeString(correct) === lowerInput);
}
