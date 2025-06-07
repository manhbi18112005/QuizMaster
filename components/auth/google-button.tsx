import { Button } from "../ui/button";
import { Google } from "../icons/google";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export function GoogleButton({ next }: { next?: string }) {
    const searchParams = useSearchParams();
    const finalNext = next ?? searchParams?.get("next");

    return (
        <Button
            className="w-full"
            text="Continue with Google"
            variant="secondary"
            onClick={() => {
                signIn("google", {
                    ...(finalNext && finalNext.length > 0
                        ? { callbackUrl: finalNext }
                        : {}),
                });
            }}
            disabled={true}
            icon={<Google className="size-4" />}
        />
    );
}