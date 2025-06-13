import { User } from "next-auth";
import { GitHubUser } from "@/types/github-user";

export function getAvatarUrl(user: (GitHubUser & User) | null | undefined): string {
    if (!user) return OG_AVATAR_URL;

    return user.avatar_url || user.image || OG_AVATAR_URL;
}

export function getAvatarFallback(user: (GitHubUser & User) | null | undefined): string {
    if (!user) return 'U';

    return user.name?.charAt(0) || user.login?.charAt(0) || 'U';
}

export const OG_AVATAR_URL = '/images/avt.png';