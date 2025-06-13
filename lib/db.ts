import Dexie, { Table } from 'dexie';
import { Question } from '@/types/quiz';
import { QuestionResult } from '@/types/test-results';
import { TestSettingsType } from '@/types/test-settings';
import { processKey } from '@/packages/keys';
/** Default tags to initialize the database with if none are present. */
export const DEFAULT_TAGS_DB = ["general"];

/**
 * Represents an entry in the `appState` table, a generic key-value store.
 */
interface AppStateEntry {
  key: string; // The unique key for the state entry.
  /** The value associated with the key. Can be of any type; specific consumers should perform type checking and casting. */
  value: unknown;
}

/**
 * Represents a question bank as stored in the database.
 * Questions are embedded directly within the bank object.
 */
export interface DbQuestionBank {
  /** Unique identifier for the question bank (e.g., UUID). */
  id: string;
  /** Name of the question bank. */
  name: string;
  /** Optional description of the question bank. */
  description?: string;
  /** Array of Question objects embedded within this bank. */
  questions: Question[];
  /** Timestamp indicating when the question bank was created. */
  createdAt: Date;
  /** Timestamp indicating when the question bank was last updated. */
  updatedAt: Date;
}

/**
 * Represents a test result as stored in the database.
 */
export interface DbTestResult {
  /** Unique identifier for the test result. */
  id: string;
  /** ID of the question bank used for this test. */
  questionBankId: string;
  /** Name of the question bank at the time of the test. */
  questionBankName: string;
  /** Total number of questions in the test. */
  totalQuestions: number;
  /** Number of correct answers. */
  correctAnswers: number;
  /** Score as a percentage (0-100). */
  score: number;
  /** Time taken to complete the test in seconds. */
  timeSpent: number;
  /** Test settings used for this test. */
  testSettings: TestSettingsType; // Store the TestSettingsType object
  /** Detailed results for each question. */
  questionResults: QuestionResult[];
  /** Timestamp when the test was completed. */
  completedAt: Date;
}

/**
 * Defines the Quiz application's database structure and versioning using Dexie.js.
 * This class manages tables for application state and question banks.
 */
export class QuizAppDatabase extends Dexie {
  /** Table for storing general application state (e.g., available tags). Keyed by string. */
  appState!: Table<AppStateEntry, string>;
  /** Table for storing question banks. Questions are embedded within each bank record. Keyed by string ID. */
  questionBanks!: Table<DbQuestionBank, string>;
  /** Table for storing test results. Keyed by string ID. */
  testResults!: Table<DbTestResult, string>;

  constructor() {
    super('quizAppDatabase'); // Specifies the database name.

    // Version 1: Defines the current schema for initial deployment.
    this.version(1).stores({
      // 'appState' table: A key-value store for application settings.
      // - 'key': Primary key.
      appState: 'key',
      // 'questionBanks' table: Stores question banks with embedded Question objects.
      // - 'id': Primary key (unique identifier for the bank).
      // - 'name': Indexed for searching/filtering banks by name.
      // - 'createdAt', 'updatedAt': Indexed for sorting banks by date.
      // Properties of the embedded Question objects within the 'questions' array
      // are not directly indexed here.
      questionBanks: 'id, name, createdAt, updatedAt',
      // 'testResults' table: Stores test results.
      // - 'id': Primary key.
      // - 'questionBankId': Indexed for retrieving results by question bank.
      // - 'completedAt': Indexed for sorting results by date.
      // - 'score': Indexed for sorting results by score.
      testResults: 'id, questionBankId, completedAt, score',
    });
    // Initialize table properties
    this.appState = this.table('appState');
    this.questionBanks = this.table('questionBanks');
    this.testResults = this.table('testResults');
  }
}

export const db = new QuizAppDatabase();

// --- AvailableTags Operations (stored in appState table) ---
const AVAILABLE_TAGS_KEY = 'availableTags';

/**
 * Retrieves the list of available tags from the app state.
 * If no tags are stored, initializes with default tags and saves them.
 * @returns A promise that resolves to an array of tag strings.
 */
export async function getAvailableTags(): Promise<string[]> {
  const entry = await db.appState.get(AVAILABLE_TAGS_KEY);
  if (entry && Array.isArray(entry.value) && entry.value.every(tag => typeof tag === 'string')) {
    return entry.value as string[];
  }
  // If no valid entry, set to default and return a new copy of default tags
  await db.appState.put({ key: AVAILABLE_TAGS_KEY, value: [...DEFAULT_TAGS_DB] });
  return [...DEFAULT_TAGS_DB];
}

/**
 * Saves the given list of tags to the app state.
 * @param tagsToSave - An array of tag strings to save.
 * @returns A promise that resolves when the tags are saved.
 */
export async function saveAvailableTags(tagsToSave: string[]): Promise<void> {
  await db.appState.put({ key: AVAILABLE_TAGS_KEY, value: tagsToSave });
}

// --- QuestionBank Operations ---

// Helper function (coreToDbQuestionBank) might not be needed if types align well or handled in calling code.
// For simplicity, we'll ensure save/update functions take what's needed;

/**
 * Retrieves all question banks, ordered by creation date.
 * Each bank includes its embedded questions.
 * @returns A promise that resolves to an array of DbQuestionBank objects.
 */
export async function getAllQuestionBanks(): Promise<DbQuestionBank[]> {
  // This will return banks, each with its 'questions' array.
  return db.questionBanks.orderBy('createdAt').toArray();
}

/**
 * Retrieves a specific question bank by its ID.
 * @param id - The ID of the question bank to retrieve.
 * @returns A promise that resolves to the DbQuestionBank object, or undefined if not found.
 */
export async function getQuestionBankById(id: string): Promise<DbQuestionBank | undefined> {
  return db.questionBanks.get(id);
}

/**
 * Interface for the data required to save a question bank.
 */
interface SaveQuestionBankParams {
  id?: string;
  name: string;
  description?: string;
  questions?: Question[]; // Questions are part of the bank data
}

/**
 * Saves a new question bank or updates an existing one if an ID is provided.
 * If no ID is provided, a new ID is generated.
 * @param bankData - The data for the question bank to save.
 * @returns A promise that resolves to the ID of the saved question bank.
 */
export async function saveQuestionBank(
  bankData: SaveQuestionBankParams
): Promise<string> {
  const id = processKey({ key: bankData.id }) || crypto.randomUUID();
  const now = new Date();

  let createdAt = now;
  let questions = bankData.questions || [];

  // Only fetch existing bank if we have an original ID (updating existing bank)
  if (bankData.id) {
    const existingBank = await db.questionBanks.get(id);
    if (existingBank) {
      createdAt = existingBank.createdAt;
      if (bankData.questions === undefined) {
        questions = existingBank.questions;
      }
    }
  }

  await db.questionBanks.put({
    id,
    name: bankData.name,
    description: bankData.description,
    questions,
    createdAt,
    updatedAt: now,
  });

  return id;
}

export async function saveQuestionBanks(banksToSave: DbQuestionBank[]): Promise<void> {
  if (banksToSave.length === 0) return;
  const banksForDb = banksToSave.map(b => ({
    ...b,
    questions: b.questions || [],
    createdAt: new Date(b.createdAt || Date.now()),
    updatedAt: new Date(b.updatedAt || Date.now()),
  }));
  await db.questionBanks.bulkPut(banksForDb);
}

/**
 * Updates an existing question bank with new data.
 * @param bankUpdateData - The update data for the question bank, must include the id of the bank to update.
 * @returns A promise that resolves when the question bank is updated.
 */
export async function updateQuestionBank(
  bankUpdateData: Partial<Omit<DbQuestionBank, 'createdAt' | 'updatedAt'>> & { id: string }
): Promise<void> {
  const existingBank = await db.questionBanks.get(bankUpdateData.id);
  if (!existingBank) {
    throw new Error(`Question bank with id ${bankUpdateData.id} not found.`);
  }

  // Merge existing with updates. Ensure 'questions' array is handled correctly.
  const bankToUpdate: DbQuestionBank = {
    ...existingBank,
    ...bankUpdateData,
    questions: bankUpdateData.questions !== undefined ? bankUpdateData.questions : existingBank.questions,
    updatedAt: new Date(),
  };
  await db.questionBanks.put(bankToUpdate);
}


export async function deleteQuestionBank(id: string): Promise<void> {
  await db.questionBanks.delete(id);
}

// --- TestResult Operations ---

/**
 * Saves a test result to the database.
 * @param testResult - The test result data to save.
 * @returns A promise that resolves to the ID of the saved test result.
 */
export async function saveTestResult(testResult: Omit<DbTestResult, 'id' | 'completedAt'>): Promise<string> {
  const id = crypto.randomUUID();
  const dbTestResult: DbTestResult = {
    ...testResult,
    id,
    completedAt: new Date(),
  };
  await db.testResults.put(dbTestResult);
  return id;
}

/**
 * Retrieves all test results for a specific question bank, ordered by completion date (newest first).
 * @param questionBankId - The ID of the question bank.
 * @returns A promise that resolves to an array of test results.
 */
export async function getTestResultsByQuestionBank(questionBankId: string): Promise<DbTestResult[]> {
  return db.testResults
    .where('questionBankId')
    .equals(questionBankId)
    .reverse()
    .toArray();
}

/**
 * Retrieves all test results, ordered by completion date (newest first).
 * @returns A promise that resolves to an array of all test results.
 */
export async function getAllTestResults(): Promise<DbTestResult[]> {
  return db.testResults.orderBy('completedAt').reverse().toArray();
}

/**
 * Deletes a test result by its ID.
 * @param id - The ID of the test result to delete.
 * @returns A promise that resolves when the test result is deleted.
 */
export async function deleteTestResult(id: string): Promise<void> {
  await db.testResults.delete(id);
}