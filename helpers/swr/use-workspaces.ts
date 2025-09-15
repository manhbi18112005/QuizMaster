import useSWR from 'swr';
import { getAllQuestionBanks } from "@/lib/db";
import { QuestionBank } from "@/types/quiz";

export default function useWorkspaces() {
    const { data, error, isLoading } = useSWR('workspaces', getAllQuestionBanks);

    return {
        workspaces: data as QuestionBank[] | null,
        error: error as Error | null,
        loading: isLoading,
    };
}