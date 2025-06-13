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

function AddWorkspaceModalHelper({
    showAddWorkspaceModal,
    setShowAddWorkspaceModal,
}: {
    showAddWorkspaceModal: boolean;
    setShowAddWorkspaceModal: Dispatch<SetStateAction<boolean>>;
}) {
    const router = useRouter();
    return (
        <Dialog open={showAddWorkspaceModal} onOpenChange={setShowAddWorkspaceModal}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Question Bank</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new question bank. Click create when you are done.
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