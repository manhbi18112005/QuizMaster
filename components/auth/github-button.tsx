import { Button } from "../ui/button";
import { Github } from "../icons/github";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LoginFormContext } from "./login-form";
import { useContext } from "react";

export const GitHubButton = () => {
    const searchParams = useSearchParams();
    const next = searchParams?.get("next");

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { setClickedMethod, clickedMethod, setLastUsedAuthMethod } =
        useContext(LoginFormContext);

    return (
        <Button
            className="w-full"
            text="Continue with Github"
            variant="secondary"
            onClick={() => {
                setClickedMethod("github");
                setLastUsedAuthMethod("github");
                signIn("github", {
                    ...(next && next.length > 0 ? { callbackUrl: next } : {}),
                });
            }}
            icon={<Github className="size-4 text-black" />}
        />
    );
};