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
import { Question } from "@/types/quiz";
import { getAllQuestionBanks, DbQuestionBank } from "@/lib/db";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TipTapViewer } from '@/components/tiptap-viewer';

interface GlobalSearchCommandProps {
    onQuestionSelect: (data: { question: Question; bankId: string; bankName: string }) => void;
}

export function GlobalSearchCommand({ onQuestionSelect }: GlobalSearchCommandProps) {
    const [inputValue, setInputValue] = useState("");
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [questionBankMap, setQuestionBankMap] = useState<Map<string, { bankId: string; bankName: string; }>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial data fetch logic
        async function initialFetch() {
            setIsLoading(true);
            try {
                const banks: DbQuestionBank[] = await getAllQuestionBanks();
                const questionsList: Question[] = [];
                const newQuestionBankMap = new Map<string, { bankId: string; bankName: string }>();
                banks.forEach(bank => {
                    if (bank.questions) {
                        bank.questions.forEach(q => {
                            questionsList.push(q);
                            newQuestionBankMap.set(q.id, { bankId: bank.id, bankName: bank.name });
                        });
                    }
                });
                setAllQuestions(questionsList);
                setFilteredQuestions(questionsList); // Initialize filtered with all
                setQuestionBankMap(newQuestionBankMap);
            } catch (error) {
                console.error("Failed to load questions for global search:", error);
                toast.error("Failed to load questions for search.");
            } finally {
                setIsLoading(false);
            }
        }
        initialFetch();
    }, []);


    useEffect(() => {
        // Debounce the filtering logic
        const handler = setTimeout(() => {
            if (!inputValue.trim()) {
                setFilteredQuestions(allQuestions);
                return;
            }
            const lowerCaseInput = inputValue.toLowerCase();
            const results = allQuestions.filter(q => {
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
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler); // Cleanup the timeout
        };
    }, [inputValue, allQuestions, questionBankMap]); // Dependencies for the effect

    const handleSelectQuestion = (selectedQuestion: Question) => {
        const bankInfo = questionBankMap.get(selectedQuestion.id);
        if (bankInfo) {
            onQuestionSelect({ question: selectedQuestion, bankId: bankInfo.bankId, bankName: bankInfo.bankName });
        } else {
            console.warn("Bank information not found for selected question:", selectedQuestion.id);
        }
        setInputValue(""); // Reset input value after selection
    };

    return (
        <Command className="rounded-lg border shadow-md"
        >
            <CommandInput
                placeholder="Search questions, tags, notes, banks..."
                value={inputValue}
                onValueChange={setInputValue}
            />
            <CommandList>
                {isLoading && (
                    <div className="p-6 flex items-center justify-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading questions...
                    </div>
                )}
                {!isLoading && filteredQuestions.length === 0 && !inputValue.trim() && (
                    <CommandEmpty>Start typing to search all questions.</CommandEmpty>
                )}
                {!isLoading && filteredQuestions.length === 0 && inputValue.trim() && (
                    <CommandEmpty>No results found for {inputValue}.</CommandEmpty>
                )}
                {!isLoading && filteredQuestions.length > 0 && (
                    <CommandGroup heading="Questions">
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
            </CommandList>
        </Command>
    );
}
