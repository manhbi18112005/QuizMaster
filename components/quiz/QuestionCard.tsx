import { FC, useCallback, memo, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, CalendarDays, CheckCircle2, Hash } from "lucide-react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from '@/types/quiz';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { SafeContent } from '@/components/safecontent';
import { detectQuestionType, getQuestionTypeConfig } from "@/lib/question-types";

interface QuestionCardProps {
    id: string;
    question: Question;
    onItemClick: (id: string) => void;
    isSelected: boolean;
}

export const QuestionCard: FC<QuestionCardProps> = memo(({ id, question, onItemClick, isSelected }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 50 : undefined
    };

    const handleClick = useCallback(() => {
        onItemClick(id);
    }, [onItemClick, id]);

    // Memoized question type detection for performance
    const questionTypeInfo = useMemo(() => {
        if (!question.choices) {
            return null;
        }

        const detectedType = detectQuestionType(question.choices);
        const config = getQuestionTypeConfig(detectedType);

        return {
            type: detectedType,
            label: config.label
        };
    }, [question.choices]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="group mb-3"
        >
            <Card
                className={`relative overflow-hidden border transition-all duration-200 cursor-pointer
                    ${isSelected
                        ? 'border-primary shadow-md bg-primary/15 dark:bg-primary/20 text-foreground'
                        : 'border-border hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/50 hover:shadow-sm bg-card'}
                    ${isDragging ? 'shadow-lg rotate-1' : ''}
                    focus-within:ring-2 focus-within:ring-primary/20 focus-within:outline-none`}
                onClick={handleClick}
            >
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <div
                            {...listeners}
                            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-muted-foreground transition-colors p-1 -ml-1 rounded hover:bg-muted/50"
                            tabIndex={-1}
                        >
                            <GripVertical size={16} />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                            <CardTitle className="text-base font-medium leading-relaxed text-foreground">
                                <SafeContent content={question.question} />
                            </CardTitle>

                            {/* Question metadata badges */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                {questionTypeInfo && (
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs font-normal border-0 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                                    >
                                        {questionTypeInfo.label}
                                    </Badge>
                                )}
                                {question.category && (
                                    <Badge
                                        variant="outline"
                                        className={`text-xs font-normal ${isSelected ? 'border-primary/40 text-foreground' : 'border-muted-foreground/20 text-muted-foreground'}`}
                                    >
                                        <Hash size={10} className="mr-1" />
                                        {question.category}
                                    </Badge>
                                )}
                                {question.difficulty && (
                                    <DifficultyBadge difficulty={question.difficulty} size="xs" />
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                {/* Correct answers section */}
                {question.choices && question.choices.some(choice => choice.isCorrect) && (
                    <CardContent>
                        <div className="space-y-2">
                            <ul className="space-y-1">
                                {question.choices.filter(choice => choice.isCorrect).map((choice, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-2 text-sm p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30"
                                    >
                                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-emerald-800 dark:text-emerald-200 font-medium">
                                            <SafeContent content={choice.value} />
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                )}

                <CardFooter className="pt-0 pb-4">
                    <div className="flex justify-between items-center w-full">
                        {/* Tags section */}
                        <div className="flex flex-wrap items-center gap-1">
                            {question.tags?.slice(0, 3).map((tag, i) => (
                                <Badge
                                    key={i}
                                    variant="outline"
                                    className={`text-xs font-normal hover:bg-muted ${isSelected ? 'bg-primary/20 border-primary/30 text-foreground' : 'bg-muted/50 border-muted-foreground/20 text-muted-foreground'}`}
                                >
                                    {tag}
                                </Badge>
                            ))}
                            {question.tags && question.tags.length > 3 && (
                                <Badge
                                    key={3}
                                    variant="outline"
                                    className={`text-xs font-normal border-dashed ${isSelected ? 'text-foreground/70 border-primary/30' : 'text-muted-foreground/70'}`}
                                >
                                    +{question.tags.length - 3}
                                </Badge>
                            )}
                        </div>

                        {/* Creation date */}
                        {question.createdAt && (
                            <div className={`flex items-center gap-1 text-xs ${isSelected ? 'text-foreground/70' : 'text-muted-foreground/70'}`}>
                                <CalendarDays size={12} />
                                <time dateTime={question.createdAt.toISOString()}>
                                    {question.createdAt.toLocaleDateString()}
                                </time>
                            </div>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
});

QuestionCard.displayName = 'QuestionCard';
