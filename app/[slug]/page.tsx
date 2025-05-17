"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import React, { useState, ChangeEvent, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { toast } from 'sonner';
import { getQuestionBankById, updateQuestionBank, getAvailableTags, saveAvailableTags, DEFAULT_TAGS_DB, DbQuestionBank } from '@/lib/db';
import { useParams } from 'next/navigation';
import { useResponsivePanelDirection } from "@/helpers/useResponsivePanelDirection";


export default function BankPage() {
  const params = useParams();
  const bankId = typeof params.slug === 'string' ? params.slug : null;

  const [currentBank, setCurrentBank] = useState<DbQuestionBank | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"edit" | "view">("edit");

  const [alertDialogState, setAlertDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
    onCancel: undefined,
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


  const showConfirmationDialog = useCallback(
    (
      title: string,
      description: string,
      onConfirmAction: () => void,
      onCancelAction?: () => void
    ) => {
      setAlertDialogState({
        isOpen: true,
        title,
        description,
        onConfirm: () => {
          onConfirmAction();
          setAlertDialogState(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => {
          if (onCancelAction) onCancelAction();
          setAlertDialogState(prev => ({ ...prev, isOpen: false }));
        },
      });
    },
    [setAlertDialogState]
  );

  const handleDialogConfirm = useCallback(() => {
    alertDialogState.onConfirm();
  }, [alertDialogState]);

  const handleDialogCancel = useCallback(() => {
    if (alertDialogState.onCancel) {
      alertDialogState.onCancel();
    }
  }, [alertDialogState]);


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
    // Export only the questions of the current bank
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
    handlers.handleImportClick(fileInputRef), [fileInputRef]);

  const handleFileImport = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    handlers.readFileAndParse(
      event,
      (parsedData) => {
        let importedQuestions: Question[];
        const importedFileBankMetadata: Partial<Pick<CoreQuestionBank, 'name' | 'description'>> = {};
        const currentBankName = currentBank?.name || "current bank";
        const dialogTitle = "Confirm Import";
        let dialogDescription: string;
        // To distinguish between importing a full bank object vs. just an array of questions
        let importType: 'fullBankImport' | 'questionsArrayImport';
        console.log(parsedData)
        if (Array.isArray(parsedData)) {
          // Case 1: Importing a direct array of Question objects
          importedQuestions = parsedData as Question[];
          importType = 'questionsArrayImport';
          dialogDescription = `Import ${importedQuestions.length} questions into "${currentBankName}"? This will replace current questions in this bank.`;
        } else if (parsedData && typeof parsedData === 'object' && 'questions' in parsedData && Array.isArray(parsedData.questions)) {
          // Case 2: Importing a CoreQuestionBank object
          const fileBank = parsedData as CoreQuestionBank;
          importedQuestions = fileBank.questions;
          importType = 'fullBankImport';

          // Capture name and description from the imported file if they exist
          if (fileBank.hasOwnProperty('name')) {
            importedFileBankMetadata.name = fileBank.name;
          }
          if (fileBank.hasOwnProperty('description')) {
            importedFileBankMetadata.description = fileBank.description;
          }

          const importedFileNameDisplay = fileBank.name || "Unnamed Imported Bank";
          dialogDescription = `Import ${importedQuestions.length} questions from file "${importedFileNameDisplay}" into current bank "${currentBankName}"? This will replace all current questions.`;

          const metadataChangeMessages: string[] = [];
          if (importedFileBankMetadata.name !== undefined && importedFileBankMetadata.name !== currentBankName) {
            metadataChangeMessages.push(`Bank name will be updated to "${importedFileBankMetadata.name}".`);
          }
          // Compare imported description with current, treating undefined/null as empty string for comparison consistency
          const currentDesc = currentBank?.description ?? "";
          const importedDesc = importedFileBankMetadata.description ?? "";
          if (importedFileBankMetadata.hasOwnProperty('description') && importedDesc !== currentDesc) {
            metadataChangeMessages.push(`Bank description will also be updated.`);
          }

          if (metadataChangeMessages.length > 0) {
            dialogDescription += " " + metadataChangeMessages.join(" ");
          }
        } else {
          toast.error("Invalid file format. Expected an array of questions or a question bank object with a 'questions' array.");
          if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input on format error
          return;
        }

        showConfirmationDialog(
          dialogTitle,
          dialogDescription,
          () => { // onConfirm action for the dialog
            if (importType === 'fullBankImport') {
              setCurrentBank(prevBank => {
                if (!prevBank) return null;
                const updates: Partial<DbQuestionBank> = {};
                if (importedFileBankMetadata.hasOwnProperty('name')) {
                  updates.name = importedFileBankMetadata.name;
                }
                if (importedFileBankMetadata.hasOwnProperty('description')) {
                  updates.description = importedFileBankMetadata.description;
                }
                return { ...prevBank, ...updates };
              });
            }

            handlers.executeImport(
              importedQuestions,
              setQuestions,
              setSelectedQuestionId,
              setAvailableTags
            );

            // Determine final bank name for the success message
            const finalBankName = (importType === 'fullBankImport' && importedFileBankMetadata.name)
              ? importedFileBankMetadata.name
              : currentBankName;
            let successMessage = `Imported ${importedQuestions.length} questions into "${finalBankName}".`;
            if (importType === 'fullBankImport' && (importedFileBankMetadata.hasOwnProperty('name') || importedFileBankMetadata.hasOwnProperty('description'))) {
              successMessage = `Imported ${importedQuestions.length} questions. Bank details for "${finalBankName}" updated from file.`;
            }
            toast.success(successMessage);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
          },
          () => {
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
          }
        );
      },
      () => { // onFinally callback for readFileAndParse (called after success or error of file reading/parsing)
        // It's generally good to reset the file input here too,
        // though primary reset happens after dialog confirmation/cancellation.
        // This handles cases where parsing itself fails before dialog.
        if (fileInputRef.current && fileInputRef.current.value !== "") {
          // console.log("Resetting file input in readFileAndParse onFinally");
          // fileInputRef.current.value = ""; // Avoid resetting if already cleared by dialog handlers
        }
      }
    );
  }, [showConfirmationDialog, currentBank, setAvailableTags, setCurrentBank, setQuestions, setSelectedQuestionId]); // Added setCurrentBank, setQuestions, setSelectedQuestionId to deps for completeness, though they are stable setters

  const handleClearAllData = useCallback(() => {
    if (!currentBank) return;
    showConfirmationDialog(
      `Confirm Clear Questions in "${currentBank.name}"`,
      "Are you sure you want to clear ALL questions in this bank? This action cannot be undone.",
      () => {
        // This updates the local 'questions' state. useEffect will save the bank.
        setQuestions([]);
        setSelectedQuestionId(null);
        toast.success(`All questions cleared from bank: ${currentBank.name}`);
        // Note: Global tags are not cleared here, only bank-specific questions.
      }
    );
  }, [showConfirmationDialog, currentBank]);


  const handleCardClick = useCallback((questionId: string) =>
    handlers.handleCardClick(questionId, setSelectedQuestionId), [setSelectedQuestionId]);

  const handleDragEnd = useCallback((event: DragEndEvent) =>
    handlers.handleDragEnd(event, setQuestions), [setQuestions]);

  const handleQuestionDetailChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    handlers.handleQuestionDetailChange(e, selectedQuestionId, setQuestions), [selectedQuestionId, setQuestions]);

  /*   const updateQuestion = useCallback((id: string, updates: Partial<Question>) =>
      handlers.updateQuestion(id, updates, setQuestions), [setQuestions]); */

  const handleChoiceChange = useCallback((index: number, value: string) =>
    handlers.handleChoiceChange(
      index,
      value,
      selectedQuestionId,
      questions,
      setQuestions
    ), [selectedQuestionId, questions, setQuestions]);

  const handleAddChoice = useCallback(() =>
    handlers.handleAddChoice(selectedQuestionId, questions, setQuestions), [selectedQuestionId, questions, setQuestions]);

  const handleRemoveChoice = useCallback((index: number) =>
    handlers.handleRemoveChoice(index, selectedQuestionId, questions, setQuestions), [selectedQuestionId, questions, setQuestions]);

  const handleChoiceIsCorrectChange = useCallback((choiceIndex: number, isCorrect: boolean) =>
    handlers.handleChoiceIsCorrectChange(
      choiceIndex,
      isCorrect,
      selectedQuestionId,
      questions,
      setQuestions
    ), [selectedQuestionId, questions, setQuestions]);

  const handleTagsChange = useCallback((newTags: string[]) =>
    handlers.handleTagsChange(
      newTags,
      selectedQuestionId,
      setQuestions,
      availableTags,
      setAvailableTags
    ), [selectedQuestionId, setQuestions, availableTags, setAvailableTags]);

  const handleSearchTermChange = useCallback((value: string) =>
    handlers.handleSearchTermChange(value, setSearchTerm), [setSearchTerm]);

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

  if (isLoading) {
    return <ContentLayout title="Loading Bank..."><p>Loading bank details...</p></ContentLayout>;
  }

  if (!currentBank) {
    return <ContentLayout title="Bank Not Found"><p>The requested question bank could not be found.</p></ContentLayout>;
  }

  return (
    <ContentLayout title={`Bank: ${currentBank.name}`}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
          <QuestionSearchInput
            searchTerm={searchTerm}
            onSearchTermChange={handleSearchTermChange}
          />
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
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <ResizablePanelGroup
            direction={panelDirection}
            className={`rounded-lg border flex-1 min-h-0 ${
              panelDirection === "vertical" ? "min-h-[60vh]" : ""
            }`}
          >
            <ResizablePanel defaultSize={33}>
              <div className="flex h-full items-start justify-center p-6 overflow-y-auto">
                <QuestionListPanelContent
                  questions={filteredQuestions}
                  selectedQuestionId={selectedQuestionId}
                  onCardClick={handleCardClick}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={67}>
              <div className="flex h-full items-start justify-center p-6 overflow-y-auto">
                <div className="w-full">
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "view")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="edit">Edit Mode</TabsTrigger>
                      <TabsTrigger value="view">View Mode</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      {selectedQuestion && (
                        <QuestionEditorPanelContent
                          selectedQuestion={selectedQuestion}
                          availableTags={availableTags}
                          onQuestionDetailChange={handleQuestionDetailChange}
                          onAddChoice={handleAddChoice}
                          onRemoveChoice={handleRemoveChoice}
                          onChoiceChange={handleChoiceChange}
                          onChoiceIsCorrectChange={handleChoiceIsCorrectChange}
                          onTagsChange={handleTagsChange}
                        />
                      )}
                      {!selectedQuestion && (
                        <p className="text-center text-muted-foreground">Select a question to edit or create a new one.</p>
                      )}
                    </TabsContent>
                    <TabsContent value="view">
                      {selectedQuestion && (
                        <QuestionViewerPanelContent
                          selectedQuestion={selectedQuestion}
                        />
                      )}
                      {!selectedQuestion && (
                        <p className="text-center text-muted-foreground">Select a question to edit or create a new one.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </DndContext>
      </div>

      <AlertDialog open={alertDialogState.isOpen} onOpenChange={(open) => {
        if (!open && alertDialogState.isOpen) {
          handleDialogCancel();
        } else {
          setAlertDialogState(prev => ({ ...prev, isOpen: open }));
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialogState.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialogState.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDialogConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContentLayout>
  );
}
