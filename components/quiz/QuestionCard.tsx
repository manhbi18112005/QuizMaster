import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, CalendarDays, CheckCircle2 } from "lucide-react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from '@/types/quiz';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { sanitizeHtml } from "@/helpers/sanitize";

interface QuestionCardProps {
    id: string;
    question: Question;
    onClick: () => void;
    isSelected: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ id, question, onClick, isSelected }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined };

    const titleText = question.question ? question.question.replace(/<[^>]*>?/gm, '') : "New Question";
    const sanitizedQuestionHtml = sanitizeHtml(question.question);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="flex items-stretch mb-3 group"
        >
            <Card
                className={`flex-1 rounded-md ${isSelected
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : 'bg-background'
                    } ${isDragging ? 'shadow-xl scale-105' : 'shadow-sm'} transition-all duration-150 ease-in-out group-hover:shadow-md`}
                onClick={onClick}
            >
                <CardHeader className="px-4 flex items-start">
                    <div {...listeners} className="mr-3 cursor-grab text-muted-foreground pt-0.5">
                        <GripVertical size={20} />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                        <CardTitle
                            className="text-base font-semibold leading-tight"
                            title={titleText || "New Question"}
                            {...(question.question
                                ? { dangerouslySetInnerHTML: { __html: sanitizedQuestionHtml } }
                                : { children: "New Question" })}
                        />
                        {question.category && (
                            <Badge variant="outline" className="text-xs font-normal mt-1.5 self-start max-w-full truncate">
                                {question.category}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-0 pb-3 px-4">
                    {question.choices && question.choices.some(choice => choice.isCorrect) && (
                        <div className="mt-2 space-y-1.5 text-sm">
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Answers:</h4>
                            <ul className="list-none pl-0">
                                {question.choices.filter(choice => choice.isCorrect).map((choice, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start text-muted-foreground font-semibold text-green-600 dark:text-green-400"
                                    >
                                        <CheckCircle2 size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                                        <span
                                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(choice.value) }}
                                            className="break-words"
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="px-4">
                    <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {question.tags?.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {question.tags && question.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{question.tags.length - 3} more
                                </Badge>
                            )}
                            {question.difficulty && (
                                <DifficultyBadge difficulty={question.difficulty} />
                            )}
                        </div>
                        {question.createdAt && (
                            <span className="flex items-center gap-1">
                                <CalendarDays size={12} />
                                {new Date(question.createdAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
