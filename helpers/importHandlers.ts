/* eslint-disable @typescript-eslint/no-unsafe-function-type,@typescript-eslint/no-explicit-any */
import { ChangeEvent, RefObject } from 'react';
import { Question, QuestionBank as CoreQuestionBank } from '@/types/quiz';
import { toast } from 'sonner';
import { DEFAULT_TAGS_DB } from '@/lib/db';
import { createDefaultQuestion } from './questionUtils';

export function handleImportClick(fileInputRef: RefObject<HTMLInputElement>) {
    fileInputRef.current?.click();
}

/**
 * Helper function to check if an item is a non-null object.
 * Assumes createDefaultQuestion will handle missing specific properties like id or question.
 *
 * @param q The item to check.
 * @returns {boolean} True if q is a non-null object, false otherwise.
 */
function isValidQuestionStructure(q: any): q is object {
    return q != null && typeof q === 'object';
}
/**
 * Type guard to check if the data is a CoreQuestionBank
 *
 * @param data
 * @returns {boolean}
 */
function isCoreQuestionBank(data: any): data is CoreQuestionBank {
    return (
        data &&
        typeof data === 'object' &&
        'id' in data &&
        'name' in data &&
        'questions' in data &&
        Array.isArray(data.questions)
    );
}

// Helper to convert binary string (from atob) to Uint8Array
function binaryStringToUint8Array(binaryString: string): Uint8Array {
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decryptData(encryptedBase64Data: string, passwordStr: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const passwordBuffer = encoder.encode(passwordStr);

    // Decode base64 and convert to Uint8Array
    const binaryString = atob(encryptedBase64Data);
    const combined = binaryStringToUint8Array(binaryString);

    // Extract salt, IV, and encrypted data
    const salt = combined.subarray(0, 16);
    const iv = combined.subarray(16, 16 + 12);
    const encryptedContent = combined.subarray(16 + 12);

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
        ['decrypt']
    );

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedContent
    );

    return decoder.decode(decryptedBuffer);
}


export function readFileAndParse(
    event: ChangeEvent<HTMLInputElement>,
    onSuccess: (parsedData: Question[] | CoreQuestionBank) => void,
    onFinally: () => void,
    requestPasswordCallback: (encryptedFileContent: string) => Promise<string | null>
) {
    const file = event.target.files?.[0];
    if (!file) {
        onFinally();
        return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target?.result;
            if (typeof text === "string") {
                let dataToProcess: any = JSON.parse(text);

                // Check if the file is encrypted
                if (dataToProcess && dataToProcess.encrypted === true && dataToProcess.algorithm === 'AES-GCM' && typeof dataToProcess.data === 'string') {
                    const password = await requestPasswordCallback(dataToProcess.data);

                    if (password === null) {
                        toast.info("Import cancelled: Password not provided for encrypted file.");
                        onFinally();
                        return;
                    }
                    if (password === "") {
                        toast.error("Import failed: Password cannot be empty for encrypted file.");
                        onFinally();
                        return;
                    }

                    try {
                        const decryptedJsonString = await decryptData(dataToProcess.data, password);
                        dataToProcess = JSON.parse(decryptedJsonString);
                        toast.success("File decrypted successfully.");
                    } catch (decryptError) {
                        console.error("Decryption error:", decryptError);
                        toast.error("Failed to decrypt file. Incorrect password or corrupted file.");
                        onFinally();
                        return;
                    }
                }

                // Proceed with processing the (potentially decrypted) data
                if (isCoreQuestionBank(dataToProcess)) {
                    if (dataToProcess.questions.every(isValidQuestionStructure)) {
                        const questionsWithDefaults = dataToProcess.questions.map(createDefaultQuestion);
                        onSuccess({ ...dataToProcess, questions: questionsWithDefaults });
                    } else {
                        toast.error("Invalid QuestionBank format: questions array contains invalid items.");
                    }
                } else if (
                    Array.isArray(dataToProcess) &&
                    dataToProcess.every(isValidQuestionStructure)
                ) {
                    const questionsWithDefaults = dataToProcess.map(createDefaultQuestion);
                    onSuccess(questionsWithDefaults);
                } else {
                    toast.error("Invalid file format. Expected an array of questions or a question bank object (potentially encrypted).");
                }
            }
        } catch (err) {
            console.error("Error importing data:", err);
            toast.error("Error importing data. Check the console for details or ensure file is valid JSON.");
        } finally {
            onFinally();
        }
    };
    reader.onerror = () => {
        toast.error("Error reading file.");
        onFinally();
    };
    reader.readAsText(file);
}

export function executeImport(
    importedQuestions: Question[],
    setQuestions: Function,
    setSelectedQuestionId: Function,
    setAvailableTags: Function
) {
    setQuestions(importedQuestions);
    setSelectedQuestionId(null);
    const allTagsFromImport = new Set<string>();
    importedQuestions.forEach((q) =>
        q.tags?.forEach((t) => allTagsFromImport.add(t))
    );

    setAvailableTags((prevTags: string[]) => {
        const combinedTags = new Set(prevTags);
        DEFAULT_TAGS_DB.forEach(tag => combinedTags.add(tag));
        allTagsFromImport.forEach(tag => combinedTags.add(tag));
        return Array.from(combinedTags);
    });

    toast.success("Questions imported successfully.");
}
