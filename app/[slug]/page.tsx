"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState, ChangeEvent, useRef, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import { Question, QuestionBank as CoreQuestionBank } from '@/types/quiz';
import { QuizToolbar } from '@/components/quiz/QuizToolbar';
import { QuestionListPanelContent } from '@/components/quiz/QuestionListPanelContent';
import { QuestionEditorPanelContent } from '@/components/quiz/QuestionEditorPanelContent';
import { QuestionViewerPanelContent } from '@/components/quiz/QuestionViewerPanelContent';
import { QuestionSearchInput } from '@/components/quiz/QuestionSearchInput';
import * as handlers from '@/helpers/questionHandlers';
import * as importHandlers from '@/helpers/importHandlers';
import { toast } from 'sonner';
import { getQuestionBankById, updateQuestionBank, getAvailableTags, saveAvailableTags, DEFAULT_TAGS_DB, DbQuestionBank } from '@/lib/db';
import { useParams } from 'next/navigation';
import { useResponsivePanelDirection } from "@/helpers/useResponsivePanelDirection";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { VariantProps } from "class-variance-authority";
import { Maximize, Minimize } from 'lucide-react';

export default function BankPage() {
  const params = useParams();
  const bankId = typeof params.slug === 'string' ? params.slug : null;

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

  const [availableTags, setAvailableTags] = useState<string[]>([...DEFAULT_TAGS_DB]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const panelDirection = useResponsivePanelDirection();

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

        if (dbBank) {
          setCurrentBank(dbBank);
          setQuestions(dbBank.questions || []);
        } else {
          toast.error(`Question bank with ID "${bankId}" not found.`);
          // Potentially redirect or show a "not found" message
        }
        setAvailableTags(dbTags);
      } catch (error) {
        console.error("Failed to load bank data from DB", error);
        toast.error("Failed to load bank data.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [bankId]);


  useEffect(() => {
    if (!isLoading && currentBank && questions !== currentBank.questions) {
      const updatedBank = { ...currentBank, questions: [...questions] };
      updateQuestionBank(updatedBank)
        .then(() => {
          // setCurrentBank(updatedBank); // Update local bank state if needed, ensure no loops
          console.log("Bank questions updated in DB.");
        })
        .catch(err => {
          console.error("Failed to save bank questions to DB", err);
          toast.error("Failed to save bank questions.");
        });
    }
  }, [questions, currentBank, isLoading]);

  // Effect to save availableTags to Dexie whenever they change (remains global)
  useEffect(() => {
    if (!isLoading) {
      saveAvailableTags(availableTags).catch(err => {
        console.error("Failed to save tags to DB", err);
        toast.error("Failed to save tags.");
      });
    }
  }, [availableTags, isLoading]);

  // Effect to toggle body scrollbar based on fullscreen state
  useEffect(() => {
    if (isFullScreen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    // Cleanup function to remove the class if the component unmounts while in fullscreen
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
  }, [dialogProps.isOpen, dialogProps.onCancel]);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateQuestion = useCallback(() => {
    handlers.handleCreateQuestion(setQuestions, setSelectedQuestionId, questions);
  }, [questions]);

  const handleExportData = useCallback(() => {
    if (!currentBank) return;
    const bankToExport: CoreQuestionBank = {
      id: currentBank.id,
      name: currentBank.name,
      description: currentBank.description,
      questions: questions,
      createdAt: currentBank.createdAt,
      updatedAt: currentBank.updatedAt,
    };
    const dataStr = JSON.stringify(bankToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${currentBank.name.replace(/\s+/g, '_')}_banks.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success(`Exported questions for bank: ${currentBank.name}`);
  }, [questions, currentBank]);


  const handleDeleteQuestion = useCallback(() => {
    if (!selectedQuestionId) {
      toast.error("No question selected to delete.");
      return;
    }
    handlers.executeDeleteQuestion(selectedQuestionId, setQuestions, setSelectedQuestionId);
  }, [selectedQuestionId]);


  const handleImportClick = useCallback(() =>
    importHandlers.handleImportClick(fileInputRef), [fileInputRef]);

  const handleFileImport = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    importHandlers.readFileAndParse(
      event,
      (parsedData) => {
        let importedQuestions: Question[];
        const importedFileBankMetadata: Partial<Pick<CoreQuestionBank, 'name' | 'description'>> = {};
        const currentBankName = currentBank?.name || "current bank";
        let dialogDescription: string;
        let importType: 'fullBankImport' | 'questionsArrayImport';

        if (Array.isArray(parsedData)) {
          importedQuestions = parsedData;
          importType = 'questionsArrayImport';
          dialogDescription = `Append ${importedQuestions.length} questions to "${currentBankName}"? This will add the imported questions to the existing ones.`;
        } else if (parsedData && typeof parsedData === 'object' && 'questions' in parsedData && Array.isArray(parsedData.questions)) {
          const fileBank = parsedData as CoreQuestionBank;
          importedQuestions = fileBank.questions;
          importType = 'fullBankImport';

          if (fileBank.name !== undefined) importedFileBankMetadata.name = fileBank.name;
          if (fileBank.description !== undefined) importedFileBankMetadata.description = fileBank.description;

          const importedFileNameDisplay = fileBank.name || "Unnamed Imported Bank";
          dialogDescription = `Append ${importedQuestions.length} questions from file "${importedFileNameDisplay}" to current bank "${currentBankName}"? This will add the imported questions to the existing ones.`;

          const metadataChangeMessages: string[] = [];
          if (importedFileBankMetadata.name !== undefined && importedFileBankMetadata.name !== currentBank?.name) {
            metadataChangeMessages.push(`Bank name will be updated to "${importedFileBankMetadata.name}".`);
          }
          const currentDesc = currentBank?.description ?? "";
          const importedDesc = importedFileBankMetadata.description ?? "";
          if (importedFileBankMetadata.description !== undefined && importedDesc !== currentDesc) {
            metadataChangeMessages.push(`Bank description will also be updated.`);
          }

          if (metadataChangeMessages.length > 0) {
            dialogDescription += ` ${metadataChangeMessages.join(" ")}`;
          }
        } else {
          toast.error("Invalid file format. Expected an array of questions or a question bank object with a 'questions' array.");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        showConfirmationDialog(
          "Confirm Import",
          dialogDescription,
          () => {
            if (importType === 'fullBankImport') {
              setCurrentBank(prevBank => {
                if (!prevBank) return null;
                const updates: Partial<DbQuestionBank> = {};
                if (importedFileBankMetadata.name !== undefined) {
                  updates.name = importedFileBankMetadata.name;
                }
                if (importedFileBankMetadata.description !== undefined) {
                  updates.description = importedFileBankMetadata.description;
                }
                return { ...prevBank, ...updates };
              });
            }

            // Append questions instead of replacing
            setQuestions(prevQuestions => [...prevQuestions, ...importedQuestions]);
            setSelectedQuestionId(null); // Deselect any selected question

            // Update available tags based on newly imported questions
            const allTagsFromImport = new Set<string>();
            importedQuestions.forEach(q => {
              if (q.tags) {
                q.tags.forEach(tag => allTagsFromImport.add(tag));
              }
            });
            setAvailableTags(prevTags => {
              const newTags = new Set([...prevTags, ...allTagsFromImport]);
              return Array.from(newTags);
            });


            const finalBankName = (importType === 'fullBankImport' && importedFileBankMetadata.name)
              ? importedFileBankMetadata.name
              : currentBankName;
            let successMessage = `Appended ${importedQuestions.length} questions to "${finalBankName}".`;
            if (importType === 'fullBankImport' && (importedFileBankMetadata.name !== undefined || importedFileBankMetadata.description !== undefined)) {
              successMessage = `Appended ${importedQuestions.length} questions. Bank details for "${finalBankName}" updated from file.`;
            }
            toast.success(successMessage);
            if (fileInputRef.current) fileInputRef.current.value = "";
          },
          () => { // onCancel
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        );
      },
      () => { // onFinally
        // Resetting file input is handled by onConfirm/onCancel,
        // but this ensures it's cleared if readFileAndParse itself fails before dialog.
        if (fileInputRef.current && fileInputRef.current.value !== "") {
          // fileInputRef.current.value = ""; // Already handled, but can be a safeguard
        }
      }
    );
  }, [showConfirmationDialog, currentBank]);

  const handleClearAllData = useCallback(() => {
    if (!currentBank) return;
    showConfirmationDialog(
      `Confirm delete all data in "${currentBank.name}"`,
      "Are you sure you want to delete ALL questions in this bank? This action cannot be undone.",
      () => {
        // This updates the local 'questions' state. useEffect will save the bank.
        setQuestions([]);
        setSelectedQuestionId(null);
        toast.success(`All questions deleted from bank: ${currentBank.name}`);
        // Note: Global tags are not cleared here, only bank-specific questions.
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
        // Check if the value is a string and includes the term
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


  if (isLoading) {
    return <ContentLayout title="Loading Bank..."><p>Loading bank details...</p></ContentLayout>;
  }

  if (!currentBank) {
    return <ContentLayout title="Bank Not Found"><p>The requested question bank could not be found.</p></ContentLayout>;
  }

  const fullScreenButtonElement = (
    <Button onClick={toggleFullScreen} variant="outline" size="icon" title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
      {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
    </Button>
  );

  const searchInputElement = (
    <QuestionSearchInput
      searchTerm={searchTerm}
      onSearchTermChange={handleSearchTermChange}
    />
  );

  return (
    <ContentLayout title={currentBank.name}>
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out ${isFullScreen ? 'fixed inset-0 bg-background z-40 p-2 sm:p-4' : 'relative'}`}>

        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
          {searchInputElement}
          <div className="flex items-center gap-2">
            <QuizToolbar
              onCreateQuestion={handleCreateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              selectedQuestionId={selectedQuestionId}
              onImportClick={handleImportClick}
              onExportData={handleExportData}
              onClearAllData={handleClearAllData}
              fileInputRef={fileInputRef}
              onFileImport={handleFileImport}
            />
            {fullScreenButtonElement}
          </div>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <ResizablePanelGroup
            direction={panelDirection}
            className="flex-1 rounded-lg border"
          >
            <ResizablePanel defaultSize={33} minSize={10} collapsedSize={5} collapsible={true}>
              <div className="h-full min-h-0 overflow-y-auto p-6">
                <QuestionListPanelContent
                  questions={filteredQuestions}
                  selectedQuestionId={selectedQuestionId}
                  onCardClick={handleCardClick}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={67} minSize={10}>
              <div className="h-full min-h-0 overflow-y-auto p-6">
                <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "edit" | "view")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="edit">Edit Mode</TabsTrigger>
                    <TabsTrigger value="view">View Mode</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit">
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
                      <p className="text-center text-muted-foreground">Select a question to edit or create a new one.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="view">
                    {selectedQuestion ? (
                      <QuestionViewerPanelContent
                        selectedQuestion={selectedQuestion}
                        onPrevious={handlePreviousQuestion}
                        onNext={handleNextQuestion}
                        canGoPrevious={canGoPrevious}
                        canGoNext={canGoNext}
                      />
                    ) : (
                      <p className="text-center text-muted-foreground">Select a question to edit or create a new one.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </DndContext>

      </div>

      <ConfirmationDialog
        open={dialogProps.isOpen}
        onOpenChange={handleDialogSystemClose}
        title={dialogProps.title}
        description={dialogProps.description}
        onConfirm={dialogProps.onConfirm}
        onCancel={dialogProps.onCancel}
        confirmButtonVariant={dialogProps.confirmButtonVariant}
      />
    </ContentLayout>
  );
}
