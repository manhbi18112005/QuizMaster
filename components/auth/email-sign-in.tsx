import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
export const EmailSignIn = () => {
    const [email, setEmail] = useState("");
    const [password] = useState("");

    return (
        <>
            <form
                className="flex flex-col gap-y-6"
            >

                <label>
                    <span className="text-content-emphasis mb-2 block text-sm font-medium leading-none">
                        Email
                    </span>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contact@nnsvn.me"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size={1}
                        className={cn(
                            "block w-full min-w-0 appearance-none rounded-md border border-neutral-300 px-3 py-2 placeholder-neutral-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm",
                        )}
                        disabled={true}
                    />
                </label>

                <Button
                    text={`Log in with ${password ? "password" : "email"}`}
                    disabled={true}
                />
            </form>
        </>
    );
};