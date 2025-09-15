import { FC } from 'react';
import { useSanitizeHtml } from '@/helpers/useSanitizeHtml';

export interface SafeContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
    content: string | undefined | null;
}

export const SafeContent: FC<SafeContentProps> = ({ content, ...props }) => {
    const sanitizedHtml = useSanitizeHtml(content);

    return (
        <div
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            {...props}
        />
    );
};
