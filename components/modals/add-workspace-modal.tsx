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
function AddWorkspaceModalHelper({
    showAddWorkspaceModal,
    setShowAddWorkspaceModal,
}: {
    showAddWorkspaceModal: boolean;
    setShowAddWorkspaceModal: Dispatch<SetStateAction<boolean>>;
}) {
    const router = useRouter();
    return (
        <CreateWorkspaceForm
            isOpen={showAddWorkspaceModal}
            onOpenChange={setShowAddWorkspaceModal}
            onBankCreated={(savedId => {
                setShowAddWorkspaceModal(false);
                router.push(`${BANKPREFIX_URL}/${savedId}`);
            })}
        />
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