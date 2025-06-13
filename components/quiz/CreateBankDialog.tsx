"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { saveQuestionBank, getAllQuestionBanks, DbQuestionBank } from "@/lib/db";

const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Bank name is required"),
    description: z.string(),
});

interface CreateBankDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onBankCreated: (banks: DbQuestionBank[]) => void;
}

export function CreateBankDialog({ isOpen, onOpenChange, onBankCreated }: CreateBankDialogProps) {
    const [isCreating, setIsCreating] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: "",
            name: "",
            description: "",
        },
    });

    const resetForm = () => {
        form.reset();
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsCreating(true);
        const idToSave = values.id?.trim() !== "" ? values.id?.trim() : undefined;

        try {
            await saveQuestionBank({
                id: idToSave,
                name: values.name,
                description: values.description,
                questions: [],
            });
            const updatedBanks = await getAllQuestionBanks();
            onBankCreated(updatedBanks);
            onOpenChange(false);
            resetForm();
            toast.success("Question bank created successfully.");
        } catch (error) {
            console.error(error, "Failed to create new bank");
            toast.error("Failed to create question bank. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
        resetForm();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Question Bank</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new question bank. Click create when you are done.
                        You can optionally provide an ID, or one will be generated.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">ID</FormLabel>
                                    <div className="col-span-3">
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., custom-bank-id (or leave blank)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">
                                        Name <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div className="col-span-3">
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Algebra Basics"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4">
                                    <FormLabel className="text-right">Description</FormLabel>
                                    <div className="col-span-3">
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., A collection of fundamental algebra questions."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={isCreating}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? "Creating..." : "Create Bank"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
