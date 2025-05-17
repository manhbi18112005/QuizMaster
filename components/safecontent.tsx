import { FC } from 'react';
import { useSanitizeHtml } from '@/helpers/useSanitizeHtml';

interface UserContentProps {
    content: string | undefined | null;
}

export const SafeContent: FC<UserContentProps> = ({ content }) => {
    const sanitizedHtml = useSanitizeHtml(content);

    return (
        <div
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};
