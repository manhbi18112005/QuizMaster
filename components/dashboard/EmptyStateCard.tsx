"use client";

import Image from "next/image";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface EmptyStateCardProps {
    onCreateBank: () => void;
}

export function EmptyStateCard({ onCreateBank }: EmptyStateCardProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center mt-10">
            <Card className="w-full max-w-md p-6">
                <CardHeader>
                    <CardTitle className="text-2xl">No Question Banks Yet!</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-48 h-48 mx-auto mb-4 relative">
                        <Image
                            src="/images/alyabonk.png"
                            alt="No question banks yet"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <PlusCircledIcon className="w-20 h-20 text-gray-400" />
                        </div>
                    </div>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Create your first question bank to start building quizzes and help
                        students with their revision.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button onClick={onCreateBank} size="lg">
                        <PlusCircledIcon className="mr-2 h-5 w-5" /> Create Your First Bank
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
