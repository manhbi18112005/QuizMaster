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
  const [password, setPassword] = useState("");

  const handleSubmit = (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault(); // Prevent default form submission if used in a form
    onSubmit(password);
    setPassword(""); // Reset password field after submission
  };

  const handleCancel = () => {
    onCancel();
    setPassword(""); // Reset password field on cancel
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
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password-input" className="text-right">
                Password
              </Label>
              <Input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
