'use client';

import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
    const { resolvedTheme } = useTheme();

    return <SonnerToaster position="top-right" richColors closeButton theme={resolvedTheme as ToasterProps['theme']} />;
}