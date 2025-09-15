"use client";

import { FC, useState, useCallback } from 'react';
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
import { useTranslation } from "@/hooks/use-translation";

const MAX_SIZE = 100 * 1024 * 1024;
const MAX_FILES = 10;
interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileImport: (files: File[]) => void;
}

export const ImportDialog: FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onFileImport,
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);

  const onFileValidate = useCallback(
    (file: File): string | null => {
      if (files.length >= 10) {
        return t("quiz.import.validation.maxFiles");
      }

      if (file.type !== "application/json" && !file.name.endsWith('.json')) {
        return t("quiz.import.validation.jsonOnly");
      }

      if (file.size > MAX_SIZE) {
        return t("quiz.import.validation.maxSize", {
          size: (MAX_SIZE / (1024 * 1024)).toFixed(2),
        });
      }

      return null;
    },
    [files, t],
  );

  const onFileReject = useCallback((file: File, message: string) => {
    toast.error(message, {
      description: t("quiz.import.validation.rejectedFile", {
        fileName: file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }),
    });
  }, [t]);

  const handleImport = () => {
    if (files.length > 0) {
      onFileImport(files);
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
            {t("quiz.import.title")}
          </DialogTitle>
          <DialogDescription>
            {t("quiz.import.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FileUpload
            value={files}
            onValueChange={setFiles}
            onFileValidate={onFileValidate}
            onFileReject={onFileReject}
            accept=".json,application/json"
            maxFiles={MAX_FILES}
            className="w-full"
          >
            <FileUploadDropzone>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">{t("quiz.import.dragDrop")}</p>
                <p className="text-muted-foreground text-xs">
                  {t("quiz.import.browseDescription")}
                </p>
              </div>
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 w-fit">
                  {t("quiz.import.browseFiles")}
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
            {t("common.cancel")}
          </Button>
          <Button onClick={handleImport} disabled={files.length === 0}>
            {t("quiz.import.importButton")} {files.length > 1 ? t("quiz.import.importFiles", { count: files.length }) : files.length === 1 ? t("quiz.import.importFile") : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
