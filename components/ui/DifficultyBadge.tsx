import React from 'react';
import { badgeVariants } from "@/components/ui/badge";
import { QuestionDifficulty } from '@/types/quiz'; // Assuming QuestionDifficulty is 'easy' | 'medium' | 'hard' | undefined

interface DifficultyBadgeProps {
    difficulty: QuestionDifficulty;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
    if (!difficulty) {
        return null;
    }

    let variantForDifficulty: "secondary" | "outline" | "destructive" | "default" = "secondary";
    let classNameForDifficulty = "text-xs";

    switch (difficulty) {
        case 'easy':
            variantForDifficulty = 'outline';
            classNameForDifficulty = 'bg-green-500 text-white hover:bg-green-500/80 text-xs';
            break;
        case 'medium':
            variantForDifficulty = 'outline';
            classNameForDifficulty = 'bg-yellow-400 text-black hover:bg-yellow-400/80 text-xs';
            break;
        case 'hard':
            variantForDifficulty = 'destructive';
            classNameForDifficulty = 'bg-red-500 text-white hover:bg-red-500/80 text-xs';
            break;
        default:
            // Keeps default 'secondary' variant and 'text-xs' className
            // Or handle unknown difficulty if necessary
            break;
    }

    return (
        <span
            className={badgeVariants({
                variant: variantForDifficulty,
                className: classNameForDifficulty,
            })}
        >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
    );
};
