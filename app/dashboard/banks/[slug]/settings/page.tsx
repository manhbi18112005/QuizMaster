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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

export default function BankSettingsPage() {

    const [isLoading, setIsLoading] = useState(false);
    const [currentBank, setCurrentBank] = useState<DbQuestionBank | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [questions, setQuestions] = useState<DbQuestionBank['questions']>([]);
    const [editBankName, setEditBankName] = useState("");
    const [editBankDescription, setEditBankDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { slug: bankId } = useParams() as { slug?: string };
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            if (!bankId) {
                toast.error("No bank ID specified.");
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
                    toast.error(`Question bank with ID "${bankId}" not found.`);
                    // Potentially redirect or show a "not found" message
                }
            } catch (error) {
                console.error(error, "Failed to load bank data from DB");
                toast.error("Failed to load bank data.");
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [bankId]);

    const handleSaveChanges = async () => {
        if (!currentBank) return;

        if (!editBankName.trim()) {
            toast.error("Bank name cannot be empty.");
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

            toast.success("Bank updated successfully!");
        } catch (error) {
            console.error(error, "Failed to update bank");
            toast.error("Failed to update bank.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBank = async () => {
        if (!currentBank) return;

        setIsDeleting(true);
        try {
            await deleteQuestionBank(currentBank.id);
            toast.success("Bank deleted successfully!");
            router.push('/dashboard');
        } catch (error) {
            console.error(error, "Failed to delete bank");
            toast.error("Failed to delete bank.");
        } finally {
            setIsDeleting(false);
            setIsDeleteAlertOpen(false);
        }
    };

    if (isLoading) {
        return (
            <LoadingScreen message="Loading bank settings..." />
        );
    }
    if (!currentBank) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold">Bank Not Found</h1>
                <p className="mt-2">The question bank you are looking for does not exist.</p>
            </div>
        );
    }
    return (
        <>
            <>
                <div className="rounded-lg border border-border bg-card">
                    <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
                        <div className="flex flex-col space-y-3">
                            <h2 className="text-xl font-medium">Workspace ID</h2>
                            <p className="text-sm text-muted-foreground">
                                Unique ID of your workspace.
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
                            Used to identify your workspace when interacting.
                        </p>
                    </div>
                </div>
            </>

            <div className="rounded-lg border border-border bg-card">
                <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
                    <div className="flex flex-col space-y-3">
                        <h2 className="text-xl font-medium">Workspace Name</h2>
                        <p className="text-sm text-muted-foreground">
                            The display name for your question bank.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Input
                            id="bank-name"
                            value={editBankName}
                            onChange={(e) => setEditBankName(e.target.value)}
                            placeholder="e.g., Algebra Basics"
                            className="w-full max-w-md"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end rounded-b-lg border-t border-border bg-muted/50 px-3 py-5 sm:px-10">
                    <Button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card">
                <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
                    <div className="flex flex-col space-y-3">
                        <h2 className="text-xl font-medium">Workspace Description</h2>
                        <p className="text-sm text-muted-foreground">
                            A brief description of what this question bank contains.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Input
                            id="bank-description"
                            value={editBankDescription}
                            onChange={(e) => setEditBankDescription(e.target.value)}
                            placeholder="e.g., A collection of fundamental algebra questions."
                            className="w-full max-w-md"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end rounded-b-lg border-t border-border bg-muted/50 px-3 py-5 sm:px-10">
                    <Button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>


            <div
                className={cn("rounded-lg border border-destructive bg-card")}
            >
                <div className="flex flex-col space-y-3 p-5 sm:p-10">
                    <h2 className="text-xl font-medium">Delete Workspace</h2>
                    <p className="text-sm text-muted-foreground">
                        Permanently delete your workspace, and all associated
                        contents + their stats. This action cannot be undone - please proceed
                        with caution.
                    </p>
                </div>
                <div
                    className={cn("border-b border-destructive")}
                />

                <div className="flex items-center justify-end px-5 py-4 sm:px-10">
                    <div>
                        <Button
                            text="Delete Workspace"
                            variant="destructive"
                            onClick={() => setIsDeleteAlertOpen(true)}
                        />
                    </div>
                </div>
            </div>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            question bank {currentBank?.name} and all its associated questions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteBank}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete Bank"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}