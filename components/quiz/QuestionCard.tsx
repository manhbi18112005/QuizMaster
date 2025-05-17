import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, ListChecks, CalendarDays } from "lucide-react"; // Added ListChecks, CalendarDays
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from '@/types/quiz';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge'; // Import the new component

interface QuestionCardProps {
    id: string;
    question: Question;
    onClick: () => void;
    isSelected: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ id, question, onClick, isSelected }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : undefined };

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
                <CardHeader className="px-4 flex items-start"> {/* Changed items-center to items-start for better alignment with multi-line content */}
                    <div {...listeners} className="mr-3 cursor-grab text-muted-foreground pt-0.5"> {/* Added pt-0.5 for alignment with title */}
                        <GripVertical size={20} />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0"> {/* Wrapper for title and category */}
                        {question.question ? (
                            <CardTitle
                                className="text-base font-semibold leading-tight"
                                title={question.question.replace(/<[^>]*>?/gm, '') || "New Question"}
                                dangerouslySetInnerHTML={{ __html: question.question }}
                            />
                        ) : (
                            <CardTitle
                                className="text-base font-semibold leading-tight"
                                title="New Question"
                            >
                                New Question
                            </CardTitle>
                        )}
                        {question.category && (
                            <Badge variant="outline" className="text-xs font-normal mt-1.5 self-start max-w-full truncate"> {/* Changed to Badge, added mt-1.5, self-start and truncation */}
                                {question.category}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-0 pb-3 px-4"> {/* Adjusted pb-3 for consistent spacing */}
                    <div className="flex flex-wrap gap-1.5 mt-2"> {/* Adjusted gap to 1.5 */}
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
                </CardContent>
                <CardFooter className="px-4">
                    <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                        <span className="flex items-center gap-1">
                            <ListChecks size={12} />
                            Choices: {question.choices?.length ?? 0}
                        </span>
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
