import { useMemo } from 'react';
import DOMPurify from 'dompurify';

const sanitizeHtml = (html: string | undefined | null): string => {
  if (!html) {
    return "";
  }
  return DOMPurify.sanitize(html);
};

export const useSanitizeHtml = (html: string | undefined | null): string => {
  return useMemo(() => sanitizeHtml(html), [html]);
};
