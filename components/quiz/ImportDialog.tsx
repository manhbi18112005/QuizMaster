"use client";

import { FC, ChangeEvent, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileImport: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const ImportDialog: FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onFileImport,
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const onFileValidate = useCallback(
    (file: File): string | null => {
      // Validate max files
      if (files.length >= 1) {
        return "You can only upload 1 file";
      }

      // Validate file type (only JSON)
      if (file.type !== "application/json" && !file.name.endsWith('.json')) {
        return "Only JSON files are allowed";
      }

      // Validate file size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`;
      }

      return null;
    },
    [files],
  );

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const handleImport = () => {
    if (files.length > 0) {
      const syntheticEvent = {
        target: {
          files: files
        },
        nativeEvent: new Event('change'),
        currentTarget: null,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        preventDefault: () => { },
        isDefaultPrevented: () => false,
        stopPropagation: () => { },
        isPropagationStopped: () => false,
        persist: () => { },
        timeStamp: Date.now(),
        type: 'change'
      } as unknown as ChangeEvent<HTMLInputElement>;
      onFileImport(syntheticEvent);
      setFiles([]);
      onClose();
    }
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Quiz Data
          </DialogTitle>
          <DialogDescription>
            Select a JSON file containing quiz questions to import.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FileUpload
            value={files}
            onValueChange={setFiles}
            onFileValidate={onFileValidate}
            onFileReject={onFileReject}
            accept=".json,application/json"
            maxFiles={1}
            className="w-full"
          >
            <FileUploadDropzone>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">Drag & drop JSON file here</p>
                <p className="text-muted-foreground text-xs">
                  Or click to browse (JSON files only)
                </p>
              </div>
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 w-fit">
                  Browse files
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
              {files.map((file) => (
                <FileUploadItem key={file.name} value={file}>
                  <FileUploadItemPreview />
                  <FileUploadItemMetadata />
                  <FileUploadItemDelete asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <X />
                    </Button>
                  </FileUploadItemDelete>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={files.length === 0}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
