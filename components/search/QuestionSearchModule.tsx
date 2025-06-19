"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/types/quiz";
import { FileText, Loader2, X } from "lucide-react";
import { TipTapViewer } from '@/components/tiptap-viewer';
import { useTranslation } from "@/hooks/use-translation";

interface QuestionSearchModuleProps {
    onQuestionSelect: (data: { question: Question; bankId: string; bankName: string }) => void;
    questions: Question[];
    questionBankMap: Map<string, { bankId: string; bankName: string; }>;
    isLoading: boolean;
}

// Create a search index for better performance
interface SearchableQuestion extends Question {
    searchText: string;
    bankInfo?: { bankId: string; bankName: string };
}

export function QuestionSearchModule({ onQuestionSelect, questions, questionBankMap, isLoading }: QuestionSearchModuleProps) {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState("");
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);

    const parseHtml = useCallback((html: string) => {
        if (!html) return "";
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            return doc.body.textContent || "";
        } catch {
            return html; // Fallback to original if parsing fails
        }
    }, []);

    // Create searchable questions with pre-computed search text
    const searchableQuestions = useMemo(() => {
        return questions.map((question): SearchableQuestion => {
            const bankInfo = questionBankMap.get(question.id);
            const searchText = [
                parseHtml(question.question),
                question.notes || "",
                question.category || "",
                ...(question.tags || []),
                ...(question.choices?.map(choice => parseHtml(choice.value)) || []),
                bankInfo?.bankName || ""
            ].join(" ").toLowerCase();

            return {
                ...question,
                searchText,
                bankInfo
            };
        });
    }, [questions, questionBankMap, parseHtml]);

    // Optimized search function with debouncing
    useEffect(() => {
        const handler = setTimeout(() => {
            if (!inputValue.trim()) {
                setFilteredQuestions(questions);
                return;
            }

            const lowerCaseInput = inputValue.toLowerCase();
            const results = searchableQuestions
                .filter(q => q.searchText.includes(lowerCaseInput))
                .map(q => ({
                    id: q.id,
                    question: q.question,
                    category: q.category,
                    tags: q.tags
                } as Question));

            setFilteredQuestions(results);
        }, 150); // Reduced debounce time for better UX

        return () => clearTimeout(handler);
    }, [inputValue, questions, searchableQuestions]);

    // Initialize filtered questions
    useEffect(() => {
        setFilteredQuestions(questions);
    }, [questions]);

    const handleSelectQuestion = useCallback((selectedQuestion: Question) => {
        const bankInfo = questionBankMap.get(selectedQuestion.id);
        if (bankInfo) {
            onQuestionSelect({ question: selectedQuestion, bankId: bankInfo.bankId, bankName: bankInfo.bankName });
        } else {
            console.warn("Bank information not found for selected question:", selectedQuestion.id);
        }
        setInputValue(parseHtml(selectedQuestion.question));
        setIsInputFocused(false);
    }, [questionBankMap, onQuestionSelect, parseHtml]);

    const handleClearInput = useCallback(() => {
        setInputValue("");
        setIsInputFocused(true);
    }, []);

    const showCommandList = isLoading || isInputFocused;

    const formatTags = useCallback((tags: string[]) => {
        if (!tags || tags.length === 0) return null;

        const visibleTags = tags.slice(0, 3);
        const remainingCount = tags.length - 3;

        return {
            visibleTags,
            remainingCount: remainingCount > 0 ? remainingCount : 0
        };
    }, []);

    return (
        <Command className="rounded-lg border shadow-md">
            <div className="relative">
                <CommandInput
                    placeholder={t("search.searchPlaceholder")}
                    value={inputValue}
                    onValueChange={setInputValue}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => {
                        setTimeout(() => {
                            setIsInputFocused(false);
                        }, 150);
                    }}
                    className={inputValue ? "pr-10" : ""}
                />
                {inputValue && (
                    <Button
                        onClick={handleClearInput}
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div
                className={`
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${showCommandList ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                <CommandList>
                    {isLoading && (
                        <div className="p-6 flex items-center justify-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t("search.loadingQuestions")}
                        </div>
                    )}
                    {!isLoading && isInputFocused && (
                        <>
                            {filteredQuestions.length === 0 ? (
                                inputValue.trim() === "" ? (
                                    <CommandEmpty>{t("search.noQuestionsAvailable")}</CommandEmpty>
                                ) : (
                                    <CommandEmpty>{t("search.noResultsFound")} {inputValue}.</CommandEmpty>
                                )
                            ) : (
                                <CommandGroup heading={inputValue.trim() === "" ? t("search.suggestions") : t("search.matchingQuestions")}>
                                    {filteredQuestions.slice(0, 20).map((question) => {
                                        const bankInfo = questionBankMap.get(question.id);
                                        const tagInfo = formatTags(question.tags || []);

                                        return (
                                            <CommandItem
                                                key={question.id}
                                                value={question.id}
                                                onSelect={() => handleSelectQuestion(question)}
                                                className="cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground p-3"
                                            >
                                                <FileText className="mr-3 h-4 w-4 flex-shrink-0" />
                                                <div className="flex flex-col overflow-hidden flex-1">
                                                    <span className="truncate text-sm font-medium">
                                                        <TipTapViewer content={question.question} />
                                                    </span>
                                                    <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                                                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                            {question.category && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {question.category}
                                                                </Badge>
                                                            )}
                                                            {tagInfo && (
                                                                <>
                                                                    {tagInfo.visibleTags.map((tag, index) => (
                                                                        <Badge key={index} variant="outline" className="text-xs">
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                    {tagInfo.remainingCount > 0 && (
                                                                        <Badge variant="outline" className="text-xs text-muted-foreground">
                                                                            +{tagInfo.remainingCount} {t("search.moreItems")}
                                                                        </Badge>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        {bankInfo && (
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {t("search.inBank")} {bankInfo.bankName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            )}
                        </>
                    )}
                </CommandList>
            </div>
        </Command>
    );
}
