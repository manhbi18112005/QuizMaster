import { useParams, useSearchParams } from "next/navigation";
import useSWR, { SWRConfiguration } from 'swr';
import { getQuestionBankById } from "@/lib/db";
import { PlanProps } from "@/types/plan";

export default function useWorkspace({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  swrOpts,
}: {
  swrOpts?: SWRConfiguration;
} = {}) {
    let { slug } = useParams() as { slug: string | null };
    const searchParams = useSearchParams();
    if (!slug) {
        slug = searchParams.get("slug") || searchParams.get("workspace");
    }

    const fetcher = async (key: string, slug: string) => {
        if (!slug) throw new Error("No slug provided");
        return await getQuestionBankById(slug);
    };

    const { data, error, isLoading } = useSWR(
        slug ? ['workspace', slug] : null,
        ([, slug]) => fetcher('workspace', slug)
    );

    return {
        workspace: data || null,
        error: error as Error | null,
        loading: isLoading,
        plan: "enterprise" as PlanProps,
        slug: data?.id || slug || null,
        itemsUsage: data?.questions?.length || 0,
        itemsLimit: 1000000,
        usage: 1000,
        usageLimit: 1000000,
    };
}