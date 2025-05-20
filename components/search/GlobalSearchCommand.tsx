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
    const [isInputFocused, setIsInputFocused] = useState(false);

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

    const showCommandList = isLoading || isInputFocused; // Visibility depends on isInputFocused

    return (
        <Command className="rounded-lg border shadow-md"
        >
            <CommandInput
                placeholder="Search questions, tags, notes, banks..."
                value={inputValue} // inputValue is preserved
                onValueChange={setInputValue}
                onFocus={() => setIsInputFocused(true)} // Re-focusing will set this to true
                onBlur={() => {
                    // Delay setting isInputFocused to false to allow click/select event on CommandItem to fire
                    setTimeout(() => {
                        setIsInputFocused(false);
                    }, 150); // Adjust delay if needed (e.g., 100-200ms)
                }} 
            />
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
