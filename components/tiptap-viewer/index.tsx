import './index.css';

import { FC, HTMLAttributes } from 'react';
import { useSanitizeHtml } from '@/helpers/useSanitizeHtml';
import { cn } from '@/lib/utils';

export interface TipTapViewerEffectiveProps extends HTMLAttributes<HTMLDivElement> {
    content: string;
}

export const TipTapViewer: FC<TipTapViewerEffectiveProps> = ({ content, className, ...restProps }) => {
    const sanitizedContent = useSanitizeHtml(content);
    return (
        <div className={cn("tiptap-viewer", className)} {...restProps} dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    );
};