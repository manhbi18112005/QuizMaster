"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { saveQuestionBank } from "@/lib/db";
import { Button } from "../ui/button";
import { useTranslation } from "@/hooks/use-translation";
interface CreateBankDialogProps {
    onBankCreated: (slug: string) => void;
}

export function CreateWorkspaceForm({ onBankCreated }: CreateBankDialogProps) {
    const { t } = useTranslation();

    const [isCreating, setIsCreating] = useState(false);

    const formSchema = z.object({
        id: z.string().optional(),
        name: z.string().min(1, t("quiz.createBank.validation.nameRequired")),
        description: z.string(),
    });


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

        try {
            const savedId = await saveQuestionBank({
                id: values.id?.trim(),
                name: values.name,
                description: values.description,
                questions: [],
            });
            onBankCreated(savedId);
            resetForm();
            toast.success(t('quiz.createBank.successMessage'));
        } catch (error) {
            console.error(error, "Failed to create new bank");
            toast.error(t('quiz.createBank.errorMessage'));
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                            <FormLabel className="text-right">
                                {t('quiz.createBank.fields.name')} <span className="text-red-500">*</span>
                            </FormLabel>
                            <div className="col-span-3">
                                <FormControl>
                                    <Input
                                        placeholder={t('quiz.createBank.fields.namePlaceholder')}
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
                            <FormLabel className="text-right">{t('quiz.createBank.fields.description')}</FormLabel>
                            <div className="col-span-3">
                                <FormControl>
                                    <Input
                                        placeholder={t('quiz.createBank.fields.descriptionPlaceholder')}
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
                    name="id"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                            <FormLabel className="text-right">{t('quiz.createBank.fields.id')}</FormLabel>
                            <div className="col-span-3">
                                <FormControl>
                                    <Input
                                        placeholder={t('quiz.createBank.fields.idPlaceholder')}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <Button className="w-full" type="submit" disabled={isCreating}>
                    {isCreating ? t('quiz.createBank.creating') : t('quiz.createBank.createButton')}
                </Button>
            </form>
        </Form>
    );
}
