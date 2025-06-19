import { FC, useState, memo } from 'react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusCircle, Trash2, Upload, FileText, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { ImportDialog } from './ImportDialog';
import { ExportDialog } from './ExportDialog';
import { useTranslation } from "@/hooks/use-translation";

interface QuizToolbarProps {
  onCreateQuestion: () => void;
  onDeleteQuestion: () => void;
  selectedQuestionId: string | null;
  onExportData: (filename?: string, formatted?: boolean, password?: string) => void;
  onClearAllData: () => void;
  onFileImport: (files: File[]) => void; // Changed from ChangeEvent<HTMLInputElement> to File[]
  disabled?: boolean;
}

export const QuizToolbar: FC<QuizToolbarProps> = memo(({
  onCreateQuestion,
  onDeleteQuestion,
  selectedQuestionId,
  onExportData,
  onClearAllData,
  onFileImport,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        {/* Primary Actions Group */}
        <div className="flex gap-2 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onCreateQuestion} size="sm" className="gap-1.5" disabled={disabled}>
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t("quiz.toolbar.newQuestion")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("quiz.toolbar.addNewQuestion")}</p>
            </TooltipContent>
          </Tooltip>

          {selectedQuestionId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onDeleteQuestion} variant="destructive" size="sm" className="gap-1.5" disabled={disabled}>
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("common.delete")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("quiz.toolbar.deleteSelectedQuestion")}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border" />

        {/* Data Management Group */}
        <div className="flex gap-2 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" size="sm" className="gap-1.5" disabled={disabled}>
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">{t("common.upload")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("quiz.toolbar.importQuizData")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setIsExportDialogOpen(true)} variant="outline" size="sm" className="gap-1.5" disabled={disabled}>
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">{t("common.download")}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("quiz.toolbar.exportQuizData")}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border" />

        {/* Danger Zone */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onClearAllData} variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" disabled={disabled}>
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">{t("quiz.toolbar.clearAll")}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("quiz.toolbar.clearAllQuizData")}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onFileImport={onFileImport}
      />

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExportData={onExportData}
      />
    </>
  );
});

QuizToolbar.displayName = 'QuizToolbar';
