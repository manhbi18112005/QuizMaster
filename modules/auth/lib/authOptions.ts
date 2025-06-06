import GitHubProvider from "next-auth/providers/github";
import type { NextAuthConfig } from 'next-auth';
import { GITHUB_ID, GITHUB_SECRET, SESSION_MAX_AGE } from "@/lib/constants";

export const authOptions: NextAuthConfig = {
    providers: [
        GitHubProvider({
            clientId: GITHUB_ID || "",
            clientSecret: GITHUB_SECRET || "",

        })
    ],
    session: {
        maxAge: SESSION_MAX_AGE,
    },
    callbacks: {
        async jwt({ token, profile }) {
            if (profile) {
                token.profile = profile;
                token.isActive = true;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                // @ts-expect-error declare user type in next-auth
                session.user.id = token.sub || token.id;

                if (token.profile) {
                    session.user = { ...session.user, ...token.profile };
                }

                // @ts-expect-error declare user type in next-auth
                session.user.isActive = token.isActive || false;
            }

            return session;
        }
    },
    pages: {
        signIn: "/auth/login",
        signOut: "/auth/logout",
        error: "/auth/login", // Error code passed in query string as ?error=
    },
};