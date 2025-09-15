/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question, QuestionBank as CoreQuestionBank } from '@/types/quiz';
import { DbQuestionBank } from '@/lib/db';
import { toast } from 'sonner';
import { createDefaultQuestion } from './questionUtils';
import { logger } from '@/packages/logger';

export interface ImportResult {
    totalImportedQuestions: number;
    successfulImports: number;
    failedImports: number;
    allNewTags: Set<string>;
    lastImportedBankMetadata: Partial<Pick<CoreQuestionBank, 'name' | 'description'>>;
}

export interface ImportCallbacks {
    requestPassword: (encryptedData: string) => Promise<string | null>;
    updateQuestions: (updater: (prev: Question[]) => Question[]) => void;
    updateBank: (updater: (prev: DbQuestionBank | null) => DbQuestionBank | null) => void;
    updateTags: (updater: (prev: string[]) => string[]) => void;
    clearSelection: () => void;
}

export async function processMultipleFiles(
    files: File[],
    callbacks: ImportCallbacks
): Promise<ImportResult> {
    let totalImportedQuestions = 0;
    let successfulImports = 0;
    let failedImports = 0;
    const allNewTags = new Set<string>();
    let lastImportedBankMetadata: Partial<Pick<CoreQuestionBank, 'name' | 'description'>> = {};

    for (const file of files) {
        try {
            const parsedData = await parseFileContent(file, callbacks.requestPassword);
            const importedQuestions = extractQuestions(parsedData, file.name);

            if (!importedQuestions) {
                failedImports++;
                continue;
            }

            // Store metadata from bank files
            if (!Array.isArray(parsedData) && parsedData && typeof parsedData === 'object' && 'questions' in parsedData) {
                const fileBank = parsedData as CoreQuestionBank;
                if (fileBank.name !== undefined || fileBank.description !== undefined) {
                    lastImportedBankMetadata = {
                        name: fileBank.name,
                        description: fileBank.description
                    };
                }
            }

            // Collect tags from this file
            importedQuestions.forEach(q => {
                if (q.tags) {
                    q.tags.forEach(tag => allNewTags.add(tag));
                }
            });

            totalImportedQuestions += importedQuestions.length;
            successfulImports++;

            // Add questions to state
            callbacks.updateQuestions(prevQuestions => [...prevQuestions, ...importedQuestions]);

        } catch (error) {
            failedImports++;
            const errorMessage = error instanceof Error ? error.message : `Failed to process file "${file.name}"`;
            toast.error(errorMessage);
        }
    }

    // Update bank metadata if we have any from imported bank files
    if (lastImportedBankMetadata.name !== undefined || lastImportedBankMetadata.description !== undefined) {
        callbacks.updateBank(prevBank => {
            if (!prevBank) return null;
            const updates: Partial<DbQuestionBank> = {};
            if (lastImportedBankMetadata.name !== undefined) {
                updates.name = lastImportedBankMetadata.name;
            }
            if (lastImportedBankMetadata.description !== undefined) {
                updates.description = lastImportedBankMetadata.description;
            }
            return { ...prevBank, ...updates };
        });
    }

    // Update available tags
    if (allNewTags.size > 0) {
        callbacks.updateTags(prevTags => {
            const newTags = new Set([...prevTags, ...allNewTags]);
            return Array.from(newTags);
        });
    }

    // Clear selection after import
    callbacks.clearSelection();

    return {
        totalImportedQuestions,
        successfulImports,
        failedImports,
        allNewTags,
        lastImportedBankMetadata
    };
}

/**
 * Helper function to check if an item is a valid question structure.
 */
function isValidQuestionStructure(q: any): q is object {
    return q != null && typeof q === 'object';
}

/**
 * Type guard to check if the data is a CoreQuestionBank
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

async function parseFileContent(
    file: File,
    requestPassword: (encryptedData: string) => Promise<string | null>
): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                let dataToProcess: any = JSON.parse(content);

                // Check if the file is encrypted (updated format check)
                if (dataToProcess && dataToProcess.encrypted === true && dataToProcess.algorithm === 'AES-GCM' && typeof dataToProcess.data === 'string') {
                    const password = await requestPassword(dataToProcess.data);

                    if (password === null) {
                        reject(new Error('Import cancelled: Password not provided for encrypted file.'));
                        return;
                    }
                    if (password === "") {
                        reject(new Error('Import failed: Password cannot be empty for encrypted file.'));
                        return;
                    }

                    try {
                        const decryptedJsonString = await decryptData(dataToProcess.data, password);
                        dataToProcess = JSON.parse(decryptedJsonString);
                        toast.success(`File "${file.name}" decrypted successfully.`);
                    } catch (decryptError) {
                        logger.error(decryptError, `Error decrypting file "${file.name}"`);
                        reject(new Error(`Failed to decrypt file "${file.name}". Incorrect password or corrupted file.`));
                        return;
                    }
                }

                resolve(dataToProcess);
            } catch (parseError) {
                logger.error(parseError, `Error parsing file "${file.name}"`);
                reject(new Error(`Invalid JSON format in file "${file.name}"`));
            }
        };
        reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));
        reader.readAsText(file);
    });
}

function extractQuestions(parsedData: any, fileName: string): Question[] | null {
    if (isCoreQuestionBank(parsedData)) {
        if (parsedData.questions.every(isValidQuestionStructure)) {
            const questionsWithDefaults = parsedData.questions.map(createDefaultQuestion);
            return questionsWithDefaults;
        } else {
            toast.error(`Invalid QuestionBank format in "${fileName}": questions array contains invalid items.`);
            return null;
        }
    } else if (Array.isArray(parsedData) && parsedData.every(isValidQuestionStructure)) {
        const questionsWithDefaults = parsedData.map(createDefaultQuestion);
        return questionsWithDefaults;
    } else {
        toast.error(`Invalid format in file "${fileName}". Expected an array of questions or a question bank object.`);
        return null;
    }
}

export function createImportSummaryMessage(
    result: ImportResult,
    currentBankName: string
): string {
    const { totalImportedQuestions, successfulImports, failedImports, lastImportedBankMetadata } = result;

    if (successfulImports > 0) {
        let message = `Successfully imported ${totalImportedQuestions} questions from ${successfulImports} file${successfulImports > 1 ? 's' : ''} to "${currentBankName}".`;

        if (lastImportedBankMetadata.name !== undefined || lastImportedBankMetadata.description !== undefined) {
            message += ` Bank details updated from imported file.`;
        }

        if (failedImports > 0) {
            message += ` ${failedImports} file${failedImports > 1 ? 's' : ''} failed to import.`;
        }

        return message;
    } else if (failedImports > 0) {
        return `All ${failedImports} file${failedImports > 1 ? 's' : ''} failed to import.`;
    }

    return 'No files were processed.';
}
