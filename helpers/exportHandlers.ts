import { QuestionBank as CoreQuestionBank } from '@/types/quiz';
import { toast } from 'sonner';
import { logger } from "@/packages/logger";

export const exportQuestionBank = async (
    currentBank: CoreQuestionBank,
    filename?: string,
    formatted?: boolean,
    password?: string
) => {
    if (!currentBank) return;

    const bankToExport: CoreQuestionBank = {
        id: currentBank.id,
        name: currentBank.name,
        description: currentBank.description,
        questions: currentBank.questions,
        createdAt: currentBank.createdAt,
        updatedAt: currentBank.updatedAt,
    };

    let dataStr = formatted ? JSON.stringify(bankToExport, null, 2) : JSON.stringify(bankToExport);
    let fileExtension = '.json';
    let mimeType = 'application/json';

    // If password is provided, encrypt the data
    if (password) {
        try {
            // Use native Web Crypto API with PBKDF2 and AES-GCM
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password);

            // Generate a random salt
            const salt = crypto.getRandomValues(new Uint8Array(16));

            // Derive key using PBKDF2
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordBuffer,
                'PBKDF2',
                false,
                ['deriveKey']
            );

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt']
            );

            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encoder.encode(dataStr)
            );

            // Combine salt, iv, and encrypted data
            const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

            // Convert Uint8Array to binary string in chunks for btoa
            let binaryString = '';
            const chunkSize = 8192; // Process in chunks to avoid call stack issues
            for (let i = 0; i < combined.length; i += chunkSize) {
                // Use subarray for a view, avoiding a copy, which is more performant than slice
                const chunk = combined.subarray(i, Math.min(i + chunkSize, combined.length));
                // String.fromCharCode.apply is efficient for converting array-like objects of char codes
                binaryString += String.fromCharCode.apply(null, chunk as unknown as number[]);
            }
            const finalBase64Data = btoa(binaryString);

            dataStr = JSON.stringify({
                encrypted: true,
                algorithm: 'AES-GCM',
                data: finalBase64Data,
                timestamp: new Date().toISOString()
            }, null, formatted ? 2 : 0);
            fileExtension = '.encrypted.json';
            mimeType = 'application/json';
        } catch (error) {
            toast.error("Failed to encrypt data. Exporting without encryption.");
            logger.error(error, "Encryption error");
        }
    }

    const dataUri = `data:${mimeType};charset=utf-8,` + encodeURIComponent(dataStr);
    const exportFileName = filename ?
        `${filename.replace(/\s+/g, '_')}${fileExtension}` :
        `${currentBank.name.replace(/\s+/g, '_')}_banks${fileExtension}`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();

    const encryptionStatus = password ? ' (encrypted)' : '';
    toast.success(`Exported questions for bank: ${currentBank.name}${encryptionStatus}`);
};
