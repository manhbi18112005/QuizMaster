import { FC, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Eye, EyeOff } from "lucide-react";
import useWorkspace from '@/helpers/swr/use-workspace';
import { useTranslation } from "@/hooks/use-translation";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExportData: (filename?: string, formatted?: boolean, password?: string) => void;
}

export const ExportDialog: FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExportData,
}) => {
  const { t } = useTranslation();

  const { workspace } = useWorkspace();
  const defaultFilename = workspace?.name ? `${workspace.name}-quiz-data` : 'quiz-data';

  const [filename, setFilename] = useState(defaultFilename);
  const [formatJson, setFormatJson] = useState(true);
  const [enablePassword, setEnablePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const canExport = !enablePassword || (password.length > 0 && passwordsMatch);

  const handleExport = () => {
    const finalFilename = filename.trim() || defaultFilename;
    const exportPassword = enablePassword ? password : undefined;
    onExportData(finalFilename, formatJson, exportPassword);
    onClose();
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setEnablePassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t("quiz.export.title")}
          </DialogTitle>
          <DialogDescription>
            {t("quiz.export.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="filename">{t("quiz.export.filename")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="quiz-data"
              />
              <span className="text-sm text-muted-foreground">.json</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="format"
              checked={formatJson}
              onCheckedChange={(checked) => setFormatJson(checked as boolean)}
            />
            <Label htmlFor="format" className="text-sm">
              {t("quiz.export.formatJson")}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="password"
              checked={enablePassword}
              onCheckedChange={(checked) => setEnablePassword(checked as boolean)}
            />
            <Label htmlFor="password" className="text-sm">
              {t("quiz.export.encryptPassword")}
            </Label>
          </div>
          {enablePassword && (
            <div className="grid gap-4 pl-6 border-l-2 border-muted">
              <div className="grid gap-2">
                <Label htmlFor="passwordInput">{t("quiz.export.password")}</Label>
                <div className="relative">
                  <Input
                    id="passwordInput"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("quiz.export.passwordPlaceholder")}
                    className="pr-10"
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPasswordInput">{t("quiz.export.confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPasswordInput"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("quiz.export.confirmPasswordPlaceholder")}
                    className={`pr-10 ${confirmPassword && !passwordsMatch ? 'border-destructive' : ''}`}
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-destructive">{t("quiz.export.passwordMismatch")}</p>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleExport} disabled={!canExport}>
            {t("quiz.export.exportButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
