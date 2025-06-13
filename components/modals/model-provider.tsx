"use client";

import { useAddWorkspaceModal } from "./add-workspace-modal";
import { useQuestionDetailModal } from "./question-detail-modal";
import { useSearchParams } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  Suspense,
  createContext,
  useEffect,
} from "react";
import { Question } from "@/types/quiz";

export const ModalContext = createContext<{
  setShowAddWorkspaceModal: Dispatch<SetStateAction<boolean>>;
  setShowQuestionDetailModal: Dispatch<SetStateAction<boolean>>;
  setSelectedQuestionDetailModal: Dispatch<SetStateAction<Question | null>>;
}>({
  setShowAddWorkspaceModal: () => {},
  setShowQuestionDetailModal: () => {},
  setSelectedQuestionDetailModal: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ModalProviderClient>{children}</ModalProviderClient>
    </Suspense>
  );
}

function ModalProviderClient({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();

  const { AddWorkspaceModal, setShowAddWorkspaceModal } =
    useAddWorkspaceModal();

  const { QuestionDetailModal, setShowQuestionDetailModal, setSelectedQuestionDetailModal } =
    useQuestionDetailModal();

  // handle ?newWorkspace and ?newLink query params
  useEffect(() => {
    if (searchParams.has("newWorkspace")) {
      setShowAddWorkspaceModal(true);
    }
  }, [searchParams, setShowAddWorkspaceModal]);

  return (
    <ModalContext.Provider
      value={{
        setShowAddWorkspaceModal,
        setShowQuestionDetailModal,
        setSelectedQuestionDetailModal
      }}
    >
      <AddWorkspaceModal />
      <QuestionDetailModal />
      {children}
    </ModalContext.Provider>
  );
}