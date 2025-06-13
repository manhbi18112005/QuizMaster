"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useState, ChangeEvent, useEffect, useCallback, useMemo, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Question, QuestionBank as CoreQuestionBank } from '@/types/quiz';
import { QuizToolbar } from '@/components/quiz/QuizToolbar';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { QuestionEditorPanelContent } from '@/components/quiz/QuestionEditorPanelContent';
import { QuestionViewerPanelContent } from '@/components/quiz/QuestionViewerPanelContent';
import { QuestionSearchInput } from '@/components/quiz/QuestionSearchInput';
import * as handlers from '@/helpers/questionHandlers';
import { processMultipleFiles, createImportSummaryMessage, ImportCallbacks } from '@/helpers/importHandlers';
import { exportQuestionBank } from '@/helpers/exportHandlers';
import { toast } from 'sonner';
import { getQuestionBankById, updateQuestionBank, getAvailableTags, saveAvailableTags, DEFAULT_TAGS_DB, DbQuestionBank } from '@/lib/db';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { VariantProps } from "class-variance-authority";
import { Maximize, Minimize, ArrowLeft, Database } from 'lucide-react';
import { PasswordInputDialog } from '@/components/quiz/PasswordInputDialog';
import { MaxWidthWrapper } from "@/components/ui/max-width-wrapper";
import LoadingScreen from "@/components/loading-screen";
import { BANKPREFIX_URL } from "@/lib/client-constants";
import { debounce } from 'lodash';

export default function BankPageClient() {
    const params = useParams();
    const bankId = typeof params.slug === 'string' ? params.slug : null;
    const searchParams = useSearchParams();
    const router = useRouter();

    const [currentBank, setCurrentBank] = useState<DbQuestionBank | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"edit" | "view">("edit");

    const [dialogProps, setDialogProps] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        onCancel: () => void;
        confirmButtonVariant?: VariantProps<typeof buttonVariants>["variant"];
    }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { },
        onCancel: () => { },
        confirmButtonVariant: 'destructive',
    });

    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [passwordRequest, setPasswordRequest] = useState<{
        encryptedData: string;
        resolve: (password: string | null) => void;
    } | null>(null);


    const [availableTags, setAvailableTags] = useState<string[]>([...DEFAULT_TAGS_DB]);

    useEffect(() => {
        async function loadData() {
            if (!bankId) {
                toast.error("No bank ID specified.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);

            try {
                const [dbBank, dbTags] = await Promise.all([
                    getQuestionBankById(bankId),
                    getAvailableTags(),
                ]);

                let loadedQuestions: Question[] = [];
                if (dbBank) {
                    setCurrentBank(dbBank);
                    loadedQuestions = dbBank.questions || [];
                    setQuestions(loadedQuestions);
                }
                setAvailableTags(dbTags);

            } catch (error) {
                console.error(error, "Failed to load bank data from DB");
                toast.error("Failed to load bank data.");
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [bankId]);

    useEffect(() => {
        if (isLoading || !questions.length) return;

        const queryQuestionId = searchParams.get('q');
        const queryTab = searchParams.get('tab');

        // Check if we're navigating within the same bank page to avoid executing logic
        // But allow execution if there are actual query parameters that need processing
        const currentPath = window.location.pathname;
        const expectedBankPath = `${BANKPREFIX_URL}/${bankId}`;
        const hasQueryParams = queryQuestionId || queryTab;

        if (currentPath === expectedBankPath && !hasQueryParams) {
            return; // Don't execute query parameter logic if we're on the same bank page without query params
        }

        if (queryQuestionId && questions.some(q => q.id === queryQuestionId)) {
            setSelectedQuestionId(queryQuestionId);
        } else if (queryQuestionId) {
            // If question ID is provided but not found, clear selection and show warning
            setSelectedQuestionId(null);
            toast.warning(`Question with ID "${queryQuestionId}" not found in this bank.`);
        }

        if (queryTab === 'edit' || queryTab === 'view') {
            setActiveTab(queryTab);
        }
    }, [searchParams, questions, isLoading, bankId]);

    useEffect(() => {
        if (!isLoading && currentBank && questions !== currentBank.questions) {
            const updatedBank = { ...currentBank, questions: [...questions] };
            updateQuestionBank(updatedBank)
                .then(() => {
                    // setCurrentBank(updatedBank); // Update local bank state if needed, ensure no loops
                    console.info("Bank questions updated in DB.");
                })
                .catch(err => {
                    console.error(err, "Failed to save bank questions to DB");
                    toast.error("Failed to save bank questions.");
                });
        }
    }, [questions, currentBank, isLoading]);

    // save availableTags to Dexie whenever they change (remains global)
    useEffect(() => {
        if (!isLoading) {
            saveAvailableTags(availableTags).catch(err => {
                console.error(err, "Failed to save tags to DB");
                toast.error("Failed to save tags.");
            });
        }
    }, [availableTags, isLoading]);

    // Toggle body scrollbar based on fullscreen state
    useEffect(() => {
        if (isFullScreen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isFullScreen]);

    const showConfirmationDialog = useCallback(
        (
            title: string,
            description: string,
            onConfirmAction: () => void,
            onCancelAction?: () => void,
            confirmButtonVariant: VariantProps<typeof buttonVariants>["variant"] = "destructive"
        ) => {
            setDialogProps({
                isOpen: true,
                title,
                description,
                onConfirm: () => {
                    onConfirmAction();
                    setDialogProps(prev => ({ ...prev, isOpen: false, title: '', description: '', onConfirm: () => { }, onCancel: () => { } }));
                },
                onCancel: () => {
                    if (onCancelAction) {
                        onCancelAction();
                    }
                    setDialogProps(prev => ({ ...prev, isOpen: false, title: '', description: '', onConfirm: () => { }, onCancel: () => { } }));
                },
                confirmButtonVariant,
            });
        }, []
    );

    const handleDialogSystemClose = useCallback((open: boolean) => {
        if (!open && dialogProps.isOpen) {
            // If the dialog is being closed by system (Escape key or overlay click)
            // and it was previously open, execute the configured cancel action.
            dialogProps.onCancel(); // This will also set isOpen to false via the onCancel closure
        }
        // If opening, it's handled by showConfirmationDialog.
        // If already closed by onConfirm/onCancel, isOpen is already false.
    }, [dialogProps]);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleCreateQuestion = useCallback(() => {
        handlers.handleCreateQuestion(setQuestions, setSelectedQuestionId, questions);
    }, [questions]);

    const handleExportData = useCallback((filename?: string, formatted?: boolean, password?: string) => {
        if (!currentBank) return;

        const bankToExport: CoreQuestionBank = {
            id: currentBank.id,
            name: currentBank.name,
            description: currentBank.description,
            questions: questions,
            createdAt: currentBank.createdAt,
            updatedAt: currentBank.updatedAt,
        };

        exportQuestionBank(bankToExport, filename, formatted, password);
    }, [questions, currentBank]);


    const handleDeleteQuestion = useCallback(() => {
        if (!selectedQuestionId) {
            toast.error("No question selected to delete.");
            return;
        }
        handlers.executeDeleteQuestion(selectedQuestionId, setQuestions, setSelectedQuestionId);
    }, [selectedQuestionId]);

    const requestPasswordForImport = useCallback((encryptedData: string): Promise<string | null> => {
        return new Promise((resolve) => {
            setPasswordRequest({ encryptedData, resolve });
            setIsPasswordDialogOpen(true);
        });
    }, []);

    const handlePasswordDialogSubmit = (password: string | null) => {
        if (passwordRequest) {
            passwordRequest.resolve(password);
        }
        setIsPasswordDialogOpen(false);
        setPasswordRequest(null);
    };


    const handleFileImport = useCallback((files: File[]) => {
        if (files.length === 0) return;

        const processFiles = async () => {
            const callbacks: ImportCallbacks = {
                requestPassword: requestPasswordForImport,
                updateQuestions: setQuestions,
                updateBank: setCurrentBank,
                updateTags: setAvailableTags,
                clearSelection: () => setSelectedQuestionId(null)
            };

            try {
                const result = await processMultipleFiles(files, callbacks);

                // Show summary toast
                const currentBankName = currentBank?.name || "current bank";
                const message = createImportSummaryMessage(result, currentBankName);

                if (result.successfulImports > 0) {
                    toast.success(message);
                } else if (result.failedImports > 0) {
                    toast.error(message);
                }
            } catch (error) {
                console.error('Import process failed:', error);
                toast.error('Import process failed unexpectedly.');
            }
        };

        const currentBankName = currentBank?.name || "current bank";
        const dialogDescription = `Import questions from ${files.length} file${files.length > 1 ? 's' : ''} to "${currentBankName}"? This will add the imported questions to the existing ones.`;

        showConfirmationDialog(
            "Confirm Multiple File Import",
            dialogDescription,
            processFiles,
            () => { /* onCancel */ }
        );
    }, [showConfirmationDialog, currentBank, requestPasswordForImport]);

    const handleClearAllData = useCallback(() => {
        if (!currentBank) return;
        showConfirmationDialog(
            `Confirm delete all data in "${currentBank.name}"`,
            "Are you sure you want to delete ALL questions in this bank? This action cannot be undone.",
            () => {
                setQuestions([]);
                setSelectedQuestionId(null);
                toast.success(`All questions deleted from bank: ${currentBank.name}`);
            }
        );
    }, [showConfirmationDialog, currentBank]);


    const handleCardClick = useCallback((questionId: string) =>
        handlers.handleCardClick(questionId, setSelectedQuestionId), []);

    const handleDragEnd = useCallback((event: DragEndEvent) =>
        handlers.handleDragEnd(event, setQuestions), []);

    const handleQuestionDetailChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handlers.handleQuestionDetailChange(e, selectedQuestionId, setQuestions), [selectedQuestionId]);

    /*   const updateQuestion = useCallback((id: string, updates: Partial<Question>) =>
        handlers.updateQuestion(id, updates, setQuestions), [setQuestions]); */

    const handleChoiceChange = useCallback((index: number, value: string) =>
        handlers.handleChoiceChange(
            index,
            value,
            selectedQuestionId,
            questions,
            setQuestions
        ), [selectedQuestionId, questions]);

    const handleAddChoice = useCallback(() =>
        handlers.handleAddChoice(selectedQuestionId, questions, setQuestions), [selectedQuestionId, questions]);

    const handleRemoveChoice = useCallback((index: number) =>
        handlers.handleRemoveChoice(index, selectedQuestionId, questions, setQuestions), [selectedQuestionId, questions]);

    const handleChoiceIsCorrectChange = useCallback((choiceIndex: number, isCorrect: boolean) =>
        handlers.handleChoiceIsCorrectChange(
            choiceIndex,
            isCorrect,
            selectedQuestionId,
            questions,
            setQuestions
        ), [selectedQuestionId, questions]);

    const handleTagsChange = useCallback((newTags: string[]) =>
        handlers.handleTagsChange(
            newTags,
            selectedQuestionId,
            setQuestions,
            availableTags,
            setAvailableTags
        ), [selectedQuestionId, availableTags]);

    const handleSearchTermChange = useCallback((value: string) =>
        handlers.handleSearchTermChange(value, setSearchTerm), []);

    const toggleFullScreen = useCallback(() => {
        setIsFullScreen(prev => !prev);
    }, []);

    const selectedQuestion = useMemo(() => questions.find(q => q.id === selectedQuestionId), [questions, selectedQuestionId]);
    const filteredQuestions = useMemo(() => {
        if (!searchTerm.trim()) {
            return questions;
        }
        const term = searchTerm.toLowerCase();
        return questions.filter(question => {
            for (const value of Object.values(question)) {
                if (typeof value === 'string' && value.toLowerCase().includes(term)) {
                    return true;
                }
                if (Array.isArray(value)) {
                    for (const item of value) {
                        if (typeof item === 'string' && item.toLowerCase().includes(term)) {
                            return true;
                        }
                        if (typeof item === 'object' && item !== null && 'value' in item && typeof item.value === 'string' && item.value.toLowerCase().includes(term)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        });
    }, [questions, searchTerm]);

    const currentQuestionIndex = useMemo(() => {
        if (!selectedQuestionId) return -1;
        return filteredQuestions.findIndex(q => q.id === selectedQuestionId);
    }, [filteredQuestions, selectedQuestionId]);

    const canGoPrevious = useMemo(() => {
        return currentQuestionIndex > 0;
    }, [currentQuestionIndex]);

    const canGoNext = useMemo(() => {
        return currentQuestionIndex !== -1 && currentQuestionIndex < filteredQuestions.length - 1;
    }, [currentQuestionIndex, filteredQuestions.length]);

    const handlePreviousQuestion = useCallback(() => {
        if (canGoPrevious) {
            setSelectedQuestionId(filteredQuestions[currentQuestionIndex - 1].id);
        }
    }, [canGoPrevious, currentQuestionIndex, filteredQuestions]);

    const handleNextQuestion = useCallback(() => {
        if (canGoNext) {
            setSelectedQuestionId(filteredQuestions[currentQuestionIndex + 1].id);
        }
    }, [canGoNext, currentQuestionIndex, filteredQuestions]);


    // Determine page title based on loading state and currentBank
    const pageTitle = currentBank ? currentBank.name : (isLoading ? "Loading Bank..." : "Bank Not Found");

    const fullScreenButtonElement = (
        <Button onClick={toggleFullScreen} variant="outline" size="icon" title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
    );

    const searchInputElement = (
        <QuestionSearchInput
            searchTerm={searchTerm}
            onSearchTermChange={handleSearchTermChange}
            disabled={isLoading}
        />
    );

    // update URL params when selectedQuestionId or activeTab changes
    useEffect(() => {
        const urlParams = new URLSearchParams();

        if (selectedQuestionId) urlParams.set('q', selectedQuestionId);
        if (selectedQuestionId) urlParams.set('tab', activeTab);

        const newUrl = `${BANKPREFIX_URL}/${bankId}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

        // Only update URL if it's actually different from current URL
        if (window.location.pathname + window.location.search !== newUrl) {
            router.replace(newUrl);
        }
    }, [selectedQuestionId, activeTab, bankId, router]);

    const itemRefs = useRef(new Map<string, HTMLDivElement | null>());

    // Create a stable debounced function
    const debouncedScrollToQuestion = useRef(
        debounce((questionId: string) => {
            const node = itemRefs.current.get(questionId);
            if (node) {
                node.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }, 150)
    );

    useEffect(() => {
        // Capture the current debounced function
        const currentDebouncedFn = debouncedScrollToQuestion.current;
        if (selectedQuestionId) currentDebouncedFn(selectedQuestionId);
        // Cleanup function uses the captured variable
        return () => {
            currentDebouncedFn.cancel();
        };
    }, [selectedQuestionId]);

    return (
        <ContentLayout title={pageTitle} description={currentBank?.description || "Manage your question bank."}>
            <MaxWidthWrapper>
                <div className={`flex flex-col h-screen ${isFullScreen ? 'fixed inset-0 bg-background z-50 p-2 sm:p-4' : 'h-[calc(100vh-4rem)]'}`}>
                    {!currentBank ? (
                        <></>
                    ) : (
                        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap shrink-0">
                            {searchInputElement}
                            <div className="flex items-center gap-2">
                                <QuizToolbar
                                    onCreateQuestion={handleCreateQuestion}
                                    onDeleteQuestion={handleDeleteQuestion}
                                    selectedQuestionId={selectedQuestionId}
                                    onExportData={handleExportData}
                                    onClearAllData={handleClearAllData}
                                    onFileImport={handleFileImport}
                                    disabled={isLoading}
                                />
                                {fullScreenButtonElement}
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <LoadingScreen className="flex-1 flex items-center justify-center" />
                    ) : !currentBank ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-6 max-w-md mx-auto p-8">
                                <div className="flex justify-center">
                                    <div className="rounded-full bg-muted p-4">
                                        <Database className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">Question Bank Not Found</h3>
                                    <p className="text-muted-foreground">
                                        The question bank you are looking for does not exist or may have been deleted.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full sm:w-auto"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 min-h-0">
                            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                                    <div className="lg:col-span-1 border rounded-lg overflow-hidden">
                                        <div className="h-full overflow-y-auto p-6">
                                            <SortableContext
                                                items={filteredQuestions.map(q => q.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {filteredQuestions.length === 0 && <p className="text-muted-foreground">No questions yet. Click create to add one.</p>}
                                                {filteredQuestions.map(q => (
                                                    <div
                                                        key={q.id}
                                                        ref={el => {
                                                            if (el) {
                                                                itemRefs.current.set(q.id, el);
                                                            } else {
                                                                itemRefs.current.delete(q.id);
                                                            }
                                                        }}
                                                    >
                                                        <QuestionCard
                                                            id={q.id}
                                                            question={q}
                                                            onItemClick={handleCardClick}
                                                            isSelected={q.id === selectedQuestionId}
                                                        />
                                                    </div>
                                                ))}
                                            </SortableContext>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 border rounded-lg overflow-hidden">
                                        <div className="h-full overflow-y-auto p-6">
                                            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "edit" | "view")} className="w-full h-full flex flex-col">
                                                <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
                                                    <TabsTrigger value="edit">Edit Mode</TabsTrigger>
                                                    <TabsTrigger value="view">View Mode</TabsTrigger>
                                                </TabsList>

                                                <div className="flex-1 min-h-0">
                                                    <TabsContent value="edit" className="h-full m-0">
                                                        {selectedQuestion ? (
                                                            <QuestionEditorPanelContent
                                                                selectedQuestion={selectedQuestion}
                                                                availableTags={availableTags}
                                                                onQuestionDetailChange={handleQuestionDetailChange}
                                                                onAddChoice={handleAddChoice}
                                                                onRemoveChoice={handleRemoveChoice}
                                                                onChoiceChange={handleChoiceChange}
                                                                onChoiceIsCorrectChange={handleChoiceIsCorrectChange}
                                                                onTagsChange={handleTagsChange}
                                                                onPrevious={handlePreviousQuestion}
                                                                onNext={handleNextQuestion}
                                                                canGoPrevious={canGoPrevious}
                                                                canGoNext={canGoNext}
                                                            />
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center">
                                                                <p className="text-center text-muted-foreground">Select a question to edit or create a new one.</p>
                                                            </div>
                                                        )}
                                                    </TabsContent>

                                                    <TabsContent value="view" className="h-full m-0">
                                                        {selectedQuestion ? (
                                                            <QuestionViewerPanelContent
                                                                selectedQuestion={selectedQuestion}
                                                                onPrevious={handlePreviousQuestion}
                                                                onNext={handleNextQuestion}
                                                                canGoPrevious={canGoPrevious}
                                                                canGoNext={canGoNext}
                                                            />
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center">
                                                                <p className="text-center text-muted-foreground">Select a question to edit or create a new one.</p>
                                                            </div>
                                                        )}
                                                    </TabsContent>
                                                </div>
                                            </Tabs>
                                        </div>
                                    </div>
                                </div>
                            </DndContext>
                        </div>
                    )}
                </div>
            </MaxWidthWrapper>

            <ConfirmationDialog
                open={dialogProps.isOpen}
                onOpenChange={handleDialogSystemClose}
                title={dialogProps.title}
                description={dialogProps.description}
                onConfirm={dialogProps.onConfirm}
                onCancel={dialogProps.onCancel}
                confirmButtonVariant={dialogProps.confirmButtonVariant}
            />

            {/* Placeholder for Password Input Dialog */}
            {isPasswordDialogOpen && passwordRequest && (
                <PasswordInputDialog
                    open={isPasswordDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) { // If dialog is closed (e.g., by Escape key or overlay click)
                            handlePasswordDialogSubmit(null); // Treat as cancellation
                        }
                        // setIsPasswordDialogOpen(open); // This will be handled by onOpenChange in PasswordInputDialog if needed
                    }}
                    onSubmit={handlePasswordDialogSubmit} // onSubmit should pass the password string
                    onCancel={() => handlePasswordDialogSubmit(null)} // onCancel should pass null
                    title="Enter Password for Import"
                    description="This file is encrypted. Please enter the password to decrypt it."
                />
            )}
        </ContentLayout>
    );
}
