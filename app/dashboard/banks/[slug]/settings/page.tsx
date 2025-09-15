"use client";

import { useParams } from "next/navigation";
import { getQuestionBankById, DbQuestionBank, saveQuestionBank, deleteQuestionBank } from '@/lib/db';
import { useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingScreen from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useRouterStuff } from "@/hooks/use-router-stuff";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";
import { useTranslation } from "@/hooks/use-translation";
import BankNotFound from "@/components/quiz/BankNotFound";

export default function BankSettingsPage() {
    const { t } = useTranslation();
    const { slug: bankId } = useParams() as { slug?: string };
    const { router } = useRouterStuff();

    const [isLoading, setIsLoading] = useState(false);
    const [currentBank, setCurrentBank] = useState<DbQuestionBank | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [questions, setQuestions] = useState<DbQuestionBank['questions']>([]);
    const [editBankName, setEditBankName] = useState("");
    const [editBankDescription, setEditBankDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function loadData() {
            if (!bankId) {
                toast.error(t('settings.workspace.no_bank_id'));
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const [dbBank] = await Promise.all([
                    getQuestionBankById(bankId),
                ]);

                if (dbBank) {
                    setCurrentBank(dbBank);
                    setQuestions(dbBank.questions || []);
                    setEditBankName(dbBank.name);
                    setEditBankDescription(dbBank.description || "");
                } else {
                    toast.error(t('settings.workspace.bank_not_found', { bankId }));
                    // Potentially redirect or show a "not found" message
                }
            } catch (error) {
                console.error(error, "Failed to load bank data from DB");
                toast.error(t('settings.workspace.failed_to_load'));
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [bankId, t]);

    const handleSaveChanges = async () => {
        if (!currentBank) return;

        if (!editBankName.trim()) {
            toast.error(t('settings.workspace.bank_name_empty'));
            return;
        }

        setIsSaving(true);
        try {
            await saveQuestionBank({
                ...currentBank,
                name: editBankName,
                description: editBankDescription,
            });

            setCurrentBank({
                ...currentBank,
                name: editBankName,
                description: editBankDescription,
            });

            toast.success(t('settings.changes_saved'));
        } catch (error) {
            console.error(error, "Failed to update bank");
            toast.error(t('settings.failed_to_save'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBank = async () => {
        if (!currentBank) return;

        setIsDeleting(true);
        try {
            await deleteQuestionBank(currentBank.id);
            toast.success(t('settings.workspace.bank_deleted_success'));
            router.push('/dashboard');
        } catch (error) {
            console.error(error, "Failed to delete bank");
            toast.error(t('settings.workspace.failed_to_delete'));
        } finally {
            setIsDeleting(false);
            setIsDeleteAlertOpen(false);
        }
    };

    if (isLoading) {
        return (
            <LoadingScreen message={t('settings.workspace.loading_message')} />
        );
    }
    if (!currentBank) {
        return (
            <BankNotFound />
        );
    }
    return (
        <>
            <>
                <div className="rounded-lg border border-border bg-card">
                    <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
                        <div className="flex flex-col space-y-3">
                            <h2 className="text-xl font-medium">{t('settings.workspace.id.title')}</h2>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.workspace.id.description')}
                            </p>
                        </div>
                        {bankId ? (
                            <div className="flex w-full max-w-md items-center justify-between rounded-md border border-border bg-background p-2">
                                <p className="text-sm text-muted-foreground">{bankId}</p>
                                <CopyButton value={bankId} className="rounded-md" />
                            </div>
                        ) : (
                            <div className="h-[2.35rem] w-full max-w-md animate-pulse rounded-md bg-muted" />
                        )}
                    </div>
                    <div className="flex items-center justify-between rounded-b-lg border-t border-border bg-muted/50 px-3 py-5 sm:px-10">
                        <p className="text-sm text-muted-foreground">
                            {t('settings.workspace.id.usage_note')}
                        </p>
                    </div>
                </div>
            </>

            <div className="rounded-lg border border-border bg-card">
                <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
                    <div className="flex flex-col space-y-3">
                        <h2 className="text-xl font-medium">{t('settings.workspace.name.title')}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t('settings.workspace.name.description')}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Input
                            id="bank-name"
                            value={editBankName}
                            onChange={(e) => setEditBankName(e.target.value)}
                            placeholder={t('settings.workspace.name.placeholder')}
                            className="w-full max-w-md"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end rounded-b-lg border-t border-border bg-muted/50 px-3 py-5 sm:px-10">
                    <Button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? t('settings.saving') : t('settings.save_changes')}
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card">
                <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
                    <div className="flex flex-col space-y-3">
                        <h2 className="text-xl font-medium">{t('settings.workspace.description.title')}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t('settings.workspace.description.description')}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Input
                            id="bank-description"
                            value={editBankDescription}
                            onChange={(e) => setEditBankDescription(e.target.value)}
                            placeholder={t('settings.workspace.description.placeholder')}
                            className="w-full max-w-md"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end rounded-b-lg border-t border-border bg-muted/50 px-3 py-5 sm:px-10">
                    <Button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? t('settings.saving') : t('settings.save_changes')}
                    </Button>
                </div>
            </div>


            <div
                className={cn("rounded-lg border border-destructive bg-card")}
            >
                <div className="flex flex-col space-y-3 p-5 sm:p-10">
                    <h2 className="text-xl font-medium">{t('settings.workspace.delete.title')}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t('settings.workspace.delete.description')}
                    </p>
                </div>
                <div
                    className={cn("border-b border-destructive")}
                />

                <div className="flex items-center justify-end px-5 py-4 sm:px-10">
                    <div>
                        <Button
                            text={t('settings.workspace.delete.button')}
                            variant="destructive"
                            onClick={() => setIsDeleteAlertOpen(true)}
                        />
                    </div>
                </div>
            </div>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('settings.workspace.delete.confirm_title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('settings.workspace.delete.confirm_description', { bankName: currentBank?.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteBank}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? t('settings.workspace.delete.deleting') : t('settings.workspace.delete.delete_bank')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}