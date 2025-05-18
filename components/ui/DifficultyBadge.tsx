import { FC } from 'react';
import { VariantProps } from 'class-variance-authority';
import { badgeVariants } from "@/components/ui/badge";
import { QuestionDifficulty } from '@/types/quiz';

interface DifficultyBadgeProps {
    difficulty: QuestionDifficulty;
    size?: string;
    variant?: VariantProps<typeof badgeVariants>['variant'];
}

export const DifficultyBadge: FC<DifficultyBadgeProps> = ({
    difficulty,
    size = 'text-xs',
    variant: overrideVariant,
}) => {
    if (!difficulty) {
        return null;
    }

    // honor overrideVariant or default to computed
    let variantForDifficulty: VariantProps<typeof badgeVariants>['variant'] =
        overrideVariant ?? 'secondary';

    let classNameForDifficulty = size;

    switch (difficulty) {
        case QuestionDifficulty.Easy:
            variantForDifficulty = 'outline';
            classNameForDifficulty = 'bg-green-500 text-white hover:bg-green-500/80';
            break;
        case QuestionDifficulty.Medium:
            variantForDifficulty = 'outline';
            classNameForDifficulty = 'bg-yellow-400 text-black hover:bg-yellow-400/80';
            break;
        case QuestionDifficulty.Hard:
            variantForDifficulty = 'destructive';
            classNameForDifficulty = 'bg-red-500 text-white hover:bg-red-500/80';
            break;
        default:
            // Keeps default or overrideVariant
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
