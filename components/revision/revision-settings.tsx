"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FancyMultiSelect } from "@/components/fancy-multi-select";
import { Clock, Hash, Filter, Navigation, AlertCircle, Play, Zap, Target, Timer, Shuffle, BookOpen, Flame, Shield, Info } from "lucide-react";
import type {
    TestSettingsType,
    TestSettingsProps,
    PresetType,
    TestPreset,
    SettingItem,
    DifficultyOption
} from "@/types/test-settings";
import { MagicCard } from "@/components/magicui/magic-card";
import { useTheme } from "next-themes";

const DEFAULT_SETTINGS: TestSettingsType = {
    hasTimeLimit: false,
    timeLimitMinutes: 30,
    hasQuestionTimeLimit: false,
    questionTimeLimitSeconds: 60,
    totalQuestions: 10,
    maxQuestions: 10,
    useTagFilter: false,
    selectedTags: [],
    allowFreeNavigation: true,
    allowPause: true,
    shuffleQuestions: true,
    shuffleAnswers: true,
    showScoreAtEnd: true,
    showCorrectAnswers: true,
    allowRetake: true,
    difficultyFilter: 'all'
};

const TEST_PRESETS: Record<PresetType, TestPreset> = {
    casual: {
        name: "Slice of Life",
        description: "Relaxed pace like a peaceful anime - take your time, no pressure",
        icon: <BookOpen className="h-4 w-4" />,
        gradient: "from-green-400 to-emerald-500",
        settings: {
            hasTimeLimit: false,
            timeLimitMinutes: 90,
            hasQuestionTimeLimit: false,
            questionTimeLimitSeconds: 120,
            allowFreeNavigation: true,
            allowPause: true,
            shuffleQuestions: false,
            shuffleAnswers: false,
            showScoreAtEnd: true,
            showCorrectAnswers: true,
            allowRetake: true,
        }
    },
    normal: {
        name: "Shonen Adventure",
        description: "Balanced journey with friends - challenging but fair like a classic battle anime",
        icon: <Target className="h-4 w-4" />,
        gradient: "from-blue-500 to-cyan-500",
        settings: {
            hasTimeLimit: true,
            timeLimitMinutes: 60,
            hasQuestionTimeLimit: false,
            questionTimeLimitSeconds: 90,
            allowFreeNavigation: true,
            allowPause: true,
            shuffleQuestions: true,
            shuffleAnswers: true,
            showScoreAtEnd: true,
            showCorrectAnswers: true,
            allowRetake: true,
        }
    },
    strict: {
        name: "Tournament Arc",
        description: "High-stakes competition with time pressure - prove your worth in the arena",
        icon: <Shield className="h-4 w-4" />,
        gradient: "from-orange-500 to-red-500",
        settings: {
            hasTimeLimit: true,
            timeLimitMinutes: 45,
            hasQuestionTimeLimit: false,
            questionTimeLimitSeconds: 75,
            allowFreeNavigation: false,
            allowPause: false,
            shuffleQuestions: true,
            shuffleAnswers: true,
            showScoreAtEnd: true,
            showCorrectAnswers: false,
            allowRetake: false,
        }
    },
    hardcore: {
        name: "Final Boss Battle",
        description: "Ultimate trial by fire - no mercy, no second chances, only victory or defeat",
        icon: <Flame className="h-4 w-4" />,
        gradient: "from-purple-600 to-pink-600",
        settings: {
            hasTimeLimit: true,
            timeLimitMinutes: 30,
            hasQuestionTimeLimit: true,
            questionTimeLimitSeconds: 45,
            allowFreeNavigation: false,
            allowPause: false,
            shuffleQuestions: true,
            shuffleAnswers: true,
            showScoreAtEnd: false,
            showCorrectAnswers: false,
            allowRetake: false,
        }
    }
};

const NAVIGATION_SETTINGS: SettingItem[] = [
    {
        key: 'allowFreeNavigation',
        label: 'Allow free navigation',
        desc: 'Jump between questions freely'
    },
    {
        key: 'allowPause',
        label: 'Allow pausing test',
        desc: 'Permit pausing during the test'
    },
];

const SCORING_SETTINGS: SettingItem[] = [
    {
        key: 'shuffleQuestions',
        label: 'Shuffle questions',
        desc: 'Randomize question order'
    },
    {
        key: 'shuffleAnswers',
        label: 'Shuffle answer options',
        desc: 'Randomize answer choice order'
    },
    {
        key: 'showScoreAtEnd',
        label: 'Show score at end',
        desc: 'Display final score after completion'
    },
    {
        key: 'showCorrectAnswers',
        label: 'Show test feedback',
        desc: 'Reveal answers and explanations after completion'
    },
    {
        key: 'allowRetake',
        label: 'Allow retaking test',
        desc: 'Permit multiple attempts'
    },
];

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
    { value: 'all', label: '🎯 All Levels' },
    { value: 'easy', label: '🟢 Easy' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'hard', label: '🔴 Hard' },
];

export function TestSettings({
    availableTags,
    maxAvailableQuestions,
    onStartTest,
    onCancel
}: TestSettingsProps) {

    const { theme } = useTheme();

    const [settings, setSettings] = useState<TestSettingsType>({
        ...DEFAULT_SETTINGS,
        totalQuestions: Math.min(10, maxAvailableQuestions),
        maxQuestions: maxAvailableQuestions,
    });

    const [selectedPreset, setSelectedPreset] = useState<PresetType | null>(null);

    const updateSetting = <K extends keyof TestSettingsType>(
        key: K,
        value: TestSettingsType[K]
    ) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        // Clear preset selection when manually changing settings
        if (selectedPreset) {
            setSelectedPreset(null);
        }
    };

    const applyPreset = (presetType: PresetType) => {
        const preset = TEST_PRESETS[presetType];
        setSettings(prev => ({
            ...prev,
            ...preset.settings,
            // Preserve these settings that shouldn't be overridden by presets
            totalQuestions: prev.totalQuestions,
            maxQuestions: prev.maxQuestions,
            useTagFilter: prev.useTagFilter,
            selectedTags: prev.selectedTags,
            difficultyFilter: prev.difficultyFilter,
        }));
        setSelectedPreset(presetType);
    };

    const handleTagsChange = (tags: string[]) => {
        setSettings(prev => ({
            ...prev,
            selectedTags: tags
        }));
    };

    const handleStartTest = () => {
        // Validation
        if (settings.totalQuestions <= 0) {
            return;
        }
        if (settings.hasTimeLimit && settings.timeLimitMinutes <= 0) {
            return;
        }
        if (settings.hasQuestionTimeLimit && settings.questionTimeLimitSeconds <= 0) {
            return;
        }

        onStartTest(settings);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">

            <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-center sm:text-left">
                            <p className="text-sm text-muted-foreground">Ready to start your test?</p>
                            <p className="font-medium">
                                {settings.totalQuestions} questions • {settings.hasTimeLimit ? `${settings.timeLimitMinutes}min limit` : 'No time limit'}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            {onCancel && (
                                <Button variant="outline" onClick={onCancel} size="lg">
                                    Cancel
                                </Button>
                            )}
                            <Button onClick={handleStartTest} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                                <Play className="h-4 w-4 mr-2" />
                                Start Test ({settings.totalQuestions} questions)
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Preset Selection */}

            <div className="space-y-4 w-full">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Choose a preset configuration or customize your own settings below</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(TEST_PRESETS).map(([key, preset]) => (
                        <Card
                            key={key}
                            className={`p-0 max-w-sm w-full shadow-none border-none cursor-pointer transition-all hover:scale-105 ${selectedPreset === key ? 'border-primary ring-2 ring-primary/20' : ''}`}
                            onClick={() => applyPreset(key as PresetType)}
                        >
                            <MagicCard
                                gradientColor={theme === "dark" ? "#262626" : "#dbd4ee"}
                                className="p-0 h-full"
                            >
                                <CardHeader className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-2 rounded-md bg-gradient-to-r ${preset.gradient} text-white`}>
                                            {preset.icon}
                                        </div>
                                        {selectedPreset === key && (
                                            <Badge variant="default" className="ml-auto text-xs">
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-sm">{preset.name}</CardTitle>
                                    <CardDescription className="text-xs leading-relaxed">
                                        {preset.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {preset.settings.hasTimeLimit && (
                                            <Badge variant="outline" className="text-xs">
                                                <Clock className="h-2 w-2 mr-1" />
                                                Timed
                                            </Badge>
                                        )}
                                        {!preset.settings.allowFreeNavigation && (
                                            <Badge variant="outline" className="text-xs">
                                                <Navigation className="h-2 w-2 mr-1" />
                                                Linear
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </MagicCard>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Time Settings Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50">
                            <Clock className="h-4 w-4" />
                        </div>
                        Time Management
                    </CardTitle>
                    <CardDescription>Control timing constraints for your test</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-200/50 dark:border-blue-800/50">
                            <div className="flex items-center space-x-3">
                                <Switch
                                    id="time-limit"
                                    checked={settings.hasTimeLimit}
                                    onCheckedChange={(checked) => updateSetting('hasTimeLimit', checked)}
                                    disabled={settings.hasQuestionTimeLimit}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="time-limit" className={`font-medium ${settings.hasQuestionTimeLimit ? 'text-muted-foreground' : ''}`}>
                                        Overall Time Limit
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Set a maximum duration for the entire test</p>
                                </div>
                            </div>
                            {settings.hasTimeLimit && !settings.hasQuestionTimeLimit && (
                                <div className="flex items-center space-x-3 ml-8">
                                    <Timer className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        min="1"
                                        max="180"
                                        value={settings.timeLimitMinutes}
                                        onChange={(e) => updateSetting('timeLimitMinutes', parseInt(e.target.value) || 1)}
                                        className="w-20 text-center"
                                    />
                                    <Label className="text-sm">minutes</Label>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-blue-200/50 dark:border-blue-800/50">
                            <div className="flex items-center space-x-3">
                                <Switch
                                    id="question-time-limit"
                                    checked={settings.hasQuestionTimeLimit}
                                    onCheckedChange={(checked) => {
                                        updateSetting('hasQuestionTimeLimit', checked);
                                        if (checked) {
                                            updateSetting('hasTimeLimit', false);
                                            updateSetting('allowFreeNavigation', false);
                                        }
                                    }}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="question-time-limit" className="font-medium">Per Question Limit</Label>
                                    <p className="text-sm text-muted-foreground">Limit time spent on each question</p>
                                </div>
                            </div>
                            {settings.hasQuestionTimeLimit && (
                                <>
                                    <div className="flex items-center space-x-3 ml-8">
                                        <Zap className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            min="10"
                                            max="300"
                                            value={settings.questionTimeLimitSeconds}
                                            onChange={(e) => updateSetting('questionTimeLimitSeconds', parseInt(e.target.value) || 10)}
                                            className="w-20 text-center"
                                        />
                                        <Label className="text-sm">seconds</Label>
                                    </div>
                                    <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                            <Info className="h-4 w-4" />
                                            Maximum test time: <strong>{Math.ceil((settings.totalQuestions * settings.questionTimeLimitSeconds) / 60)} minutes</strong>
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                        <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Free navigation is disabled when per-question time limits are active
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question Settings Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50">
                            <Hash className="h-4 w-4" />
                        </div>
                        Question Configuration
                    </CardTitle>
                    <CardDescription>Customize the number and difficulty of questions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-emerald-200/50 dark:border-emerald-800/50">
                            <div className="space-y-2">
                                <Label htmlFor="total-questions" className="font-medium flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Number of Questions
                                </Label>
                                <Input
                                    id="total-questions"
                                    type="number"
                                    min="1"
                                    max={settings.maxQuestions}
                                    value={settings.totalQuestions}
                                    onChange={(e) => updateSetting('totalQuestions', parseInt(e.target.value) || 1)}
                                    className="w-full text-center text-lg font-semibold"
                                />
                                <Badge variant="secondary" className="w-fit">
                                    Max available: {settings.maxQuestions}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-emerald-200/50 dark:border-emerald-800/50">
                            <div className="space-y-2">
                                <Label htmlFor="difficulty" className="font-medium">Difficulty Level</Label>
                                <Select
                                    value={settings.difficultyFilter}
                                    onValueChange={(value: 'all' | 'easy' | 'medium' | 'hard') =>
                                        updateSetting('difficultyFilter', value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DIFFICULTY_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tag Filtering Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/50">
                            <Filter className="h-4 w-4" />
                        </div>
                        Content Filtering
                    </CardTitle>
                    <CardDescription>Filter questions by specific topics or tags</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-purple-200/50 dark:border-purple-800/50">
                        <Switch
                            id="use-tag-filter"
                            checked={settings.useTagFilter}
                            onCheckedChange={(checked) => updateSetting('useTagFilter', checked)}
                        />
                        <div className="space-y-1">
                            <Label htmlFor="use-tag-filter" className="font-medium">Enable Tag Filtering</Label>
                            <p className="text-sm text-muted-foreground">Only include questions with selected tags</p>
                        </div>
                    </div>

                    {settings.useTagFilter && (
                        <div className="space-y-4 p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-purple-200/50 dark:border-purple-800/50">
                            <Label className="font-medium">Select Tags:</Label>
                            <FancyMultiSelect
                                value={settings.selectedTags}
                                onChange={handleTagsChange}
                                availableOptions={availableTags}
                                placeholder="Select tags to filter questions..."
                            />
                            {settings.selectedTags.length === 0 && (
                                <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <p className="text-sm text-amber-700 dark:text-amber-300">
                                        No tags selected - all questions will be included
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Behavior Settings Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/20 dark:to-red-950/20">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                        <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/50">
                            <Navigation className="h-4 w-4" />
                        </div>
                        Test Behavior
                    </CardTitle>
                    <CardDescription>Configure how the test behaves and what feedback is shown</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">Navigation & Control</h4>

                            <div className="space-y-4">
                                {NAVIGATION_SETTINGS.map((setting) => (
                                    <div key={setting.key} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <Switch
                                            id={setting.key}
                                            checked={Boolean(settings[setting.key])}
                                            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                                            className="mt-1"
                                            disabled={setting.key === 'allowFreeNavigation' && settings.hasQuestionTimeLimit}
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor={setting.key} className={`font-medium text-sm ${setting.key === 'allowFreeNavigation' && settings.hasQuestionTimeLimit ? 'text-muted-foreground' : ''}`}>
                                                {setting.label}
                                            </Label>
                                            <p className="text-xs text-muted-foreground">{setting.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                                <Shuffle className="h-3 w-3" />
                                Randomization & Scoring
                            </h4>

                            <div className="space-y-4">
                                {SCORING_SETTINGS.map((setting) => (
                                    <div key={setting.key} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <Switch
                                            id={setting.key}
                                            checked={Boolean(settings[setting.key])}
                                            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                                            className="mt-1"
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor={setting.key} className="font-medium text-sm">{setting.label}</Label>
                                            <p className="text-xs text-muted-foreground">{setting.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
