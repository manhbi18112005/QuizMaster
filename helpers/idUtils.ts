/**
 * Generates a random numeric ID with 10-12 digits
 */
export function generateNumericId(): string {
    const timestamp = Date.now().toString().slice(-6);
    const randomDigits = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return timestamp + randomDigits;
}
