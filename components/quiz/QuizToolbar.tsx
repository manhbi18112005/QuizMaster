import { RefObject, FC, ChangeEvent, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FilePlus2, Trash2, Upload, Download } from "lucide-react";
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
      <div className="space-x-2 flex flex-wrap gap-1 items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onCreateQuestion} size="icon">
              <FilePlus2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create Question Card</p>
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
                <Button onClick={onDeleteQuestion} variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Selected Question</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import Data</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setIsExportDialogOpen(true)} variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export Data</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onClearAllData} variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear All Data</p>
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
