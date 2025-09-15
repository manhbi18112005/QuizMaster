import { FC } from 'react';
import { VariantProps } from 'class-variance-authority';
import { badgeVariants } from "@/components/ui/badge";
import { QuestionDifficulty } from '@/types/quiz';
import { useTranslation } from '@/hooks/use-translation';

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
    const { t } = useTranslation();

    if (!difficulty) {
        return null;
    }

    // honor overrideVariant or default to computed
    let variantForDifficulty: VariantProps<typeof badgeVariants>['variant'] =
        overrideVariant ?? 'secondary';

    let classNameForDifficulty = size;
    let label = '';

    switch (difficulty) {
        case QuestionDifficulty.Easy:
            variantForDifficulty = 'outline';
            classNameForDifficulty = 'bg-green-500 text-white hover:bg-green-500/80';
            label = t('quiz.difficulty.easy');
            break;
        case QuestionDifficulty.Medium:
            variantForDifficulty = 'outline';
            classNameForDifficulty = 'bg-yellow-400 text-black hover:bg-yellow-400/80';
            label = t('quiz.difficulty.medium');
            break;
        case QuestionDifficulty.Hard:
            variantForDifficulty = 'destructive';
            classNameForDifficulty = 'bg-red-500 text-white hover:bg-red-500/80';
            label = t('quiz.difficulty.hard');
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
            {label}
        </span>
    );
};
