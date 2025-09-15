"use client";

import { FC, FormEvent, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";

interface PasswordInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export const PasswordInputDialog: FC<PasswordInputDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  onCancel,
  title = "Enter Password",
  description = "Please enter the password for the encrypted file."
}) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");

  const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    onSubmit(password);
    setPassword("");
  };

  const handleCancel = () => {
    onCancel();
    setPassword("");
  };

  // Handle onOpenChange to also trigger cancel if dialog is closed externally
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleCancel(); // Ensure cancel logic (like clearing passwordRequest) is triggered
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title || t("quiz.passwordDialog.title")}</DialogTitle>
            {description && <DialogDescription>{description || t("quiz.passwordDialog.description")}</DialogDescription>}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-input" className="text-right">
                {t("quiz.passwordDialog.password")}
              </Label>
              <Input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>{t("common.cancel")}</Button>
            <Button type="submit">{t("quiz.passwordDialog.submitButton")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
