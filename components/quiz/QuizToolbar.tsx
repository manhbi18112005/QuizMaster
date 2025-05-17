import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FilePlus2, Trash2, Upload, Download } from "lucide-react";

interface QuizToolbarProps {
  onCreateQuestion: () => void;
  onDeleteQuestion: () => void;
  selectedQuestionId: string | null;
  onImportClick: () => void;
  onExportData: () => void;
  onClearAllData: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const QuizToolbar: React.FC<QuizToolbarProps> = ({
  onCreateQuestion,
  onDeleteQuestion,
  selectedQuestionId,
  onImportClick,
  onExportData,
  onClearAllData,
  fileInputRef,
  onFileImport,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="space-x-2 flex flex-wrap gap-1">
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onDeleteQuestion} variant="destructive" size="icon" disabled={!selectedQuestionId}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete Selected Question</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onImportClick} variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import Data</p>
          </TooltipContent>
        </Tooltip>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileImport}
          accept=".json"
          style={{ display: 'none' }}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onExportData} variant="outline" size="icon">
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
    </div>
  );
};
