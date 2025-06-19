
import { useTranslation } from "@/hooks/use-translation";
import { Database, ArrowLeft } from "lucide-react";
import { useRouterStuff } from '@/hooks/use-router-stuff';
import { Button } from "../ui/button";

export default function BankNotFound() {
    const { t } = useTranslation();
    const { router } = useRouterStuff();

    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
                <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-4">
                        <Database className="h-8 w-8 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{t('quiz.bank.notFound')}</h3>
                    <p className="text-muted-foreground">
                        {t('quiz.bank.notFoundDescription')}
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard')}
                    className="w-full sm:w-auto"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('quiz.bank.backToDashboard')}
                </Button>
            </div>
        </div>
    );
}