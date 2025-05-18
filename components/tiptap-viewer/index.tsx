import './index.css';

import { FC } from 'react';
import { SafeContent, UserContentProps } from '@/components/safecontent';


export const TipTapViewer: FC<UserContentProps> = ({ content }) => {
    return (
        <div className="tiptap-viewer">
            <SafeContent content={content} />
        </div>
    );
}