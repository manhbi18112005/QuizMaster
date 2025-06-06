"use client";

import { useState, useEffect } from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Question } from "@/types/quiz";
import { FileText, Loader2, X } from "lucide-react";
import { TipTapViewer } from '@/components/tiptap-viewer';
interface QuestionSearchModuleProps {
    onQuestionSelect: (data: { question: Question; bankId: string; bankName: string }) => void;
    questions: Question[];
    questionBankMap: Map<string, { bankId: string; bankName: string; }>;
    isLoading: boolean;
}

export function QuestionSearchModule({ onQuestionSelect, questions, questionBankMap, isLoading }: QuestionSearchModuleProps) {
    const [inputValue, setInputValue] = useState("");
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);

    useEffect(() => {
        setFilteredQuestions(questions);
    }, [questions]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (!inputValue.trim()) {
                setFilteredQuestions(questions);
                return;
            }
            const lowerCaseInput = inputValue.toLowerCase();
            const results = questions.filter(q => {
                const bankInfo = questionBankMap.get(q.id);
                return (
                    q.question.toLowerCase().includes(lowerCaseInput) ||
                    q.notes?.toLowerCase().includes(lowerCaseInput) ||
                    q.category?.toLowerCase().includes(lowerCaseInput) ||
                    q.tags?.some(tag => tag.toLowerCase().includes(lowerCaseInput)) ||
                    q.choices?.some(choice => choice.value.toLowerCase().includes(lowerCaseInput)) ||
                    (bankInfo && bankInfo.bankName.toLowerCase().includes(lowerCaseInput))
                );
            });
            setFilteredQuestions(results);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, questions, questionBankMap]);

    const parseHtml = (html: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        return doc.body.textContent || "";
    }

    const handleSelectQuestion = (selectedQuestion: Question) => {
        const bankInfo = questionBankMap.get(selectedQuestion.id);
        if (bankInfo) {
            onQuestionSelect({ question: selectedQuestion, bankId: bankInfo.bankId, bankName: bankInfo.bankName });
        } else {
            console.warn("Bank information not found for selected question:", selectedQuestion.id);
        }
        setInputValue(parseHtml(selectedQuestion.question)); // Set the input value to the selected question
        setIsInputFocused(false); // This line causes the list to hide
    };

    const handleClearInput = () => {
        setInputValue("");
        setIsInputFocused(true); // Keep the list visible after clearing
    };

    const showCommandList = isLoading || isInputFocused; // Visibility depends on isInputFocused

    return (
        <Command className="rounded-lg border shadow-md">
            <div className="relative">
                <CommandInput
                    placeholder="Search questions, tags, notes, banks..."
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
                    ${showCommandList ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} // Controls actual visibility
                `}
            >
                <CommandList>
                    {isLoading && (
                        <div className="p-6 flex items-center justify-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Loading questions...
                        </div>
                    )}
                    {!isLoading && isInputFocused && (
                        <>
                            {filteredQuestions.length === 0 ? (
                                inputValue.trim() === "" ? (
                                    <CommandEmpty>No questions available.</CommandEmpty>
                                ) : (
                                    <CommandEmpty>No results found for {inputValue}.</CommandEmpty>
                                )
                            ) : (
                                <CommandGroup heading={inputValue.trim() === "" ? "Suggestions" : "Matching Questions"}>
                                    {filteredQuestions.map((question) => {
                                        const bankInfo = questionBankMap.get(question.id);
                                        return (
                                            <CommandItem
                                                key={question.id}
                                                value={`${question.question} ${bankInfo?.bankName || ''} ${question.tags?.join(' ')} ${question.notes} ${question.category}`}
                                                onSelect={() => handleSelectQuestion(question)}
                                                className="cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground p-3"
                                            >
                                                <FileText className="mr-3 h-4 w-4 flex-shrink-0" />
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="truncate text-sm font-medium">
                                                        <TipTapViewer content={question.question} />
                                                    </span>
                                                    {bankInfo && (
                                                        <span className="text-xs text-muted-foreground mt-0.5">
                                                            In: {bankInfo.bankName}
                                                        </span>
                                                    )}
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
