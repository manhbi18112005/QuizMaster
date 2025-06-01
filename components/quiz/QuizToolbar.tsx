import { FC, ChangeEvent, useState } from 'react';
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

interface QuizToolbarProps {
  onCreateQuestion: () => void;
  onDeleteQuestion: () => void;
  selectedQuestionId: string | null;
  onExportData: (filename?: string, formatted?: boolean, password?: string) => void;
  onClearAllData: () => void;
  onFileImport: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const QuizToolbar: FC<QuizToolbarProps> = ({
  onCreateQuestion,
  onDeleteQuestion,
  selectedQuestionId,
  onExportData,
  onClearAllData,
  onFileImport,
}) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        {/* Primary Actions Group */}
        <div className="flex gap-2 items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onCreateQuestion} size="sm" className="gap-1.5">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">New Question</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add a new question</p>
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
                  <Button onClick={onDeleteQuestion} variant="destructive" size="sm" className="gap-1.5">
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete selected question</p>
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
              <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" size="sm" className="gap-1.5">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Import quiz data</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setIsExportDialogOpen(true)} variant="outline" size="sm" className="gap-1.5">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export quiz data</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-border" />

        {/* Danger Zone */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onClearAllData} variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Clear All</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear all quiz data</p>
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
};
