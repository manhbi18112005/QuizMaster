import { FC, useCallback, memo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, CalendarDays, CheckCircle2 } from "lucide-react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from '@/types/quiz';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { SafeContent } from '@/components/safecontent';

interface QuestionCardProps {
    id: string;
    question: Question;
    onItemClick: (id: string) => void;
    isSelected: boolean;
}

export const QuestionCard: FC<QuestionCardProps> = memo(({ id, question, onItemClick, isSelected }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined };

    const handleClick = useCallback(() => {
        onItemClick(id);
    }, [onItemClick, id]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="flex items-stretch mb-1 group"
        >
            <Card
                className={`gap-2 py-2 flex-1 rounded-md cursor-pointer
                    ${isSelected
                    ? 'bg-primary/20 dark:bg-primary/20'
                    : 'bg-background hover:bg-primary/10 dark:hover:bg-primary/20'}
                    ${isDragging ? 'shadow-xl scale-105' : 'shadow-sm'}
                    transition-all duration-150 ease-in-out
                    ${!isSelected ? 'hover:shadow-md' : ''}`}
                onClick={handleClick} // Use the memoized handleClick
            >
                <CardHeader className="px-3 py-2 flex items-start">
                    <div {...listeners} className="mr-2 cursor-grab text-muted-foreground pt-0.5">
                        <GripVertical size={18} />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                        <CardTitle
                            className="text-sm font-semibold leading-tight"
                        >
                            <SafeContent content={question.question} />
                        </CardTitle>
                        {question.category && (
                            <Badge variant="outline" className="text-xs font-normal mt-1 self-start max-w-full truncate">
                                {question.category}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2 px-3">
                    {question.choices && question.choices.some(choice => choice.isCorrect) && (
                        <div className="mt-1 space-y-1 text-xs">
                            <ul className="list-none pl-0">
                                {question.choices.filter(choice => choice.isCorrect).map((choice, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start font-semibold text-green-600 dark:text-green-400"
                                    >
                                        <CheckCircle2 size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                                        <span className="whitespace-normal break-words">
                                            <SafeContent content={choice.value} />
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="px-3 py-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                        <div className="flex flex-wrap gap-1 mt-1">
                            {question.tags?.slice(0, 2).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {question.tags && question.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{question.tags.length - 2} more
                                </Badge>
                            )}
                            {question.difficulty && (
                                <DifficultyBadge difficulty={question.difficulty} size="xs" />
                            )}
                        </div>
                        {question.createdAt && (
                            <span className="flex items-center gap-1 text-xxs">
                                <CalendarDays size={10} />
                                {new Date(question.createdAt).toLocaleDateString(undefined, { year: '2-digit', month: 'numeric', day: 'numeric' })}
                            </span>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
});

QuestionCard.displayName = 'QuestionCard';
