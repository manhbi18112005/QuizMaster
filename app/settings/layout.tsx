"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import SettingsSidebar from "@/components/settings/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";

export default function SettingsLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const { data: session } = useSession();

	return (
		<AdminPanelLayout>
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex items-center justify-between px-4 py-3 md:px-6">
					<div className="flex items-center gap-3">
						{session?.user?.image ? (
							<Image
								src={session.user.image}
								alt={session.user.name || "User"}
								width={32}
								height={32}
								className="h-8 w-8 rounded-full"
							/>
						) : (
							<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
								<User className="h-4 w-4 text-primary" />
							</div>
						)}
						<div className="block">
							<p className="text-sm font-medium">
								{session?.user?.name || "Guest User"}
							</p>
							<p className="text-xs text-muted-foreground">
								{session?.user?.email || "No email available"}
							</p>
						</div>
					</div>

					<div className="flex flex-1 items-center justify-end">
						<Button className="mr-2" variant="outline" size="sm" asChild>
							<Link href="/dashboard" className="flex items-center gap-2">
								<ArrowLeft className="h-4 w-4" />
								<span className="hidden sm:inline">Back to Dashboard</span>
								<span className="sm:hidden">Dashboard</span>
							</Link>
						</Button>
						<ModeToggle />
						<UserNav />
					</div>
				</div>
			</div>

			<div className="flex h-full">
				<SettingsSidebar />

				<main className="flex-1 space-y-4 p-4 md:p-6 pt-6">
					{children}
				</main>
			</div>
		</AdminPanelLayout>
	);
}