export interface TestSettingsType {
    // Time settings
    hasTimeLimit: boolean;
    timeLimitMinutes: number;
    hasQuestionTimeLimit: boolean;
    questionTimeLimitSeconds: number;

    // Question settings
    totalQuestions: number;
    maxQuestions: number;

    // Filtering
    useTagFilter: boolean;
    selectedTags: string[];

    // Behavior settings
    allowFreeNavigation: boolean;
    allowPause: boolean;
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;

    // Scoring and feedback
    showScoreAtEnd: boolean;
    showCorrectAnswers: boolean;
    allowRetake: boolean;

    // Difficulty
    difficultyFilter: 'all' | 'easy' | 'medium' | 'hard';
}

export interface TestSettingsProps {
    availableTags: string[];
    maxAvailableQuestions: number;
    onStartTest: (settings: TestSettingsType) => void;
    onCancel?: () => void;
}

export type PresetType = 'strict' | 'normal' | 'hardcore' | 'casual';

export interface TestPreset {
    name: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    settings: Partial<TestSettingsType>;
}

export interface SettingItem {
    key: keyof TestSettingsType;
    label: string;
    desc: string;
}

export interface DifficultyOption {
    value: 'all' | 'easy' | 'medium' | 'hard';
    label: string;
}
