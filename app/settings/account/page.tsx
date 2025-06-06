"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { User } from "next-auth";
import { GitHubUser } from "@/types/github-user";
import { ShieldCheck, Star, Calendar, HardDrive, Lock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Type guard to check if user has GitHub properties
function isGitHubUser(user: unknown): user is GitHubUser & User {
    return user !== null &&
        typeof user === 'object' &&
        user !== undefined &&
        'login' in user &&
        typeof (user as Record<string, unknown>).login === 'string' &&
        'avatar_url' in user &&
        typeof (user as Record<string, unknown>).avatar_url === 'string' &&
        ('id' in user && (typeof (user as Record<string, unknown>).id === 'number' || typeof (user as Record<string, unknown>).id === 'string'));
}

export default function SettingsProfilePage() {
    const { data: session, status } = useSession();

    // Show loading state while session is being fetched
    if (status === "loading") {
        return (
            <ContentLayout showNavbar={false} title="Account Settings">
                <div className="flex items-center justify-center w-full h-full">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                </div>
            </ContentLayout>
        );
    }

    // Only redirect if session is confirmed to be null (not loading)
    if (status === "unauthenticated" || !session || !session.user) {
        redirect("/auth/login");
    }

    // If not a GitHub user, redirect or show error
    if (!isGitHubUser(session.user)) {
        return (
            <ContentLayout showNavbar={false} title="Account Settings">
                <div className="flex items-center justify-center w-full h-full">
                    <p className="text-red-500">GitHub account information not available.</p>
                </div>
            </ContentLayout>
        );
    }

    // Now we can safely use the user as GitHubUser
    const user = session.user;

    return (
        <ContentLayout showNavbar={false} title="Account Settings">
            <div className="container max-w-4xl mx-auto p-6 space-y-6">
                {/* Profile Header */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage 
                                        src={user?.avatar_url || user?.image || '/default-avatar.png'} 
                                        alt="Profile Avatar" 
                                    />
                                    <AvatarFallback className="text-xl">
                                        {user?.name?.charAt(0) || user?.login?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-semibold">
                                        {user?.name}
                                    </h1>
                                    <p className="text-muted-foreground">@{user?.login}</p>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                                <Badge variant="secondary">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Verified
                                </Badge>

                                {user?.plan?.name && user.plan.name !== 'free' && (
                                    <Badge>
                                        <Star className="w-3 h-3 mr-1" />
                                        Pro
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {user?.bio && (
                            <>
                                <Separator className="my-4" />
                                <p className="text-sm text-muted-foreground">{user.bio}</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Account Details Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Security & Account */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Security & Account
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">Two-Factor Authentication</span>
                                </div>
                                <Badge 
                                    variant={user?.two_factor_authentication ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    {user?.two_factor_authentication ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">Account Status</span>
                                </div>
                                <Badge 
                                    variant={user?.isActive ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    {user?.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            <Separator />
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Member Since</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-6">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    }) : 'Unknown'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subscription Plan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Plan & Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Storage Space</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-6">
                                    {user?.plan?.space ? `${(user.plan.space / 1024 / 1024).toFixed(0)} MB` : 'Unlimited'}
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Private Repositories</span>
                                </div>
                                <p className="text-sm text-muted-foreground ml-6">
                                    {user?.total_private_repos || 0} / {user?.plan?.private_repos || 'Unlimited'}
                                </p>
                            </div>

                            <Separator />
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Disk Usage</span>
                                </div>
                                <div className="ml-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {user?.disk_usage ? `${(user.disk_usage / 1024).toFixed(2)} MB` : '0 MB'}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {user?.plan?.space ? `${(user.plan.space / 1024 / 1024).toFixed(0)} MB` : 'Unlimited'}
                                        </span>
                                    </div>
                                    <Progress 
                                        value={user?.plan?.space 
                                            ? Math.min((user.disk_usage || 0) / user.plan.space * 100, 100) 
                                            : 0
                                        } 
                                        className="h-2"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ContentLayout>
    );
}