import { User } from "next-auth";
import { GitHubUser } from "@/types/github-user";

export function getAvatarUrl(user: (GitHubUser & User) | null | undefined): string {
    if (!user) return '/default-avatar.png';

    return user.avatar_url || user.image || '/default-avatar.png';
}

export function getAvatarFallback(user: (GitHubUser & User) | null | undefined): string {
    if (!user) return 'U';

    return user.name?.charAt(0) || user.login?.charAt(0) || 'U';
}

export const OG_AVATAR_URL = '/images/avt.png';