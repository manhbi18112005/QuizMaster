import { useRouter } from "next/navigation";
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useMemo,
    useState,
} from "react";
import { CreateWorkspaceForm } from "../dashboard/create-workspace-form";
import { BANKPREFIX_URL } from "@/lib/client-constants";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";

function AddWorkspaceModalHelper({
    showAddWorkspaceModal,
    setShowAddWorkspaceModal,
}: {
    showAddWorkspaceModal: boolean;
    setShowAddWorkspaceModal: Dispatch<SetStateAction<boolean>>;
}) {

    const router = useRouter();
    const { t } = useTranslation();

    return (
        <Dialog open={showAddWorkspaceModal} onOpenChange={setShowAddWorkspaceModal}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('quiz.createBank.title')}</DialogTitle>
                    <DialogDescription>
                        {t('quiz.createBank.description')}
                    </DialogDescription>
                </DialogHeader>
                <CreateWorkspaceForm
                    onBankCreated={(savedId => {
                        setShowAddWorkspaceModal(false);
                        router.push(`${BANKPREFIX_URL}/${savedId}`);
                    })}
                />
            </DialogContent>
        </Dialog>
    );
}

export function useAddWorkspaceModal() {
    const [showAddWorkspaceModal, setShowAddWorkspaceModal] = useState(false);
    const AddWorkspaceModal = useCallback(() => {
        return (
            <AddWorkspaceModalHelper
                showAddWorkspaceModal={showAddWorkspaceModal}
                setShowAddWorkspaceModal={setShowAddWorkspaceModal}
            />
        );
    }, [showAddWorkspaceModal, setShowAddWorkspaceModal]);

    return useMemo(
        () => ({ setShowAddWorkspaceModal, AddWorkspaceModal }),
        [setShowAddWorkspaceModal, AddWorkspaceModal],
    );
}