"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { settingsNavItems } from "@/lib/menu-list";

function SettingsNav({ className }: { className?: string }) {
	const pathname = usePathname();

	return (
		<nav className={cn("space-y-1", className)}>
			{settingsNavItems.map((item) => {
				const Icon = item.icon;
				const isActive = pathname === item.href;

				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
							isActive
								? "bg-accent text-accent-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						<Icon className="h-4 w-4" />
						{item.title}
					</Link>
				);
			})}
		</nav>
	);
}

export default function SettingsSidebar() {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<>
			{/* Desktop Sidebar */}
			<div className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-background/50">
				<div className="flex flex-col gap-2 p-6">
					<SettingsNav />
				</div>
			</div>

			{/* Mobile Header */}
			<div className="flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 md:hidden">
				<h1 className="text-lg font-semibold">Settings</h1>
				<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
						>
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle navigation menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-64 p-0">
						<div className="flex flex-col gap-2 p-6">
							<div className="flex items-center gap-2 px-2 mb-4">
								<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium">
									S
								</div>
								<span className="font-semibold">Settings</span>
							</div>
							<SettingsNav />
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}
