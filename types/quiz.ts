import { QuestionType } from "@/lib/question-types";

export enum QuestionDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard'
}
export interface QuestionAnswer {
  value: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  question: string;
  choices: QuestionAnswer[];
  tags: string[];
  notes: string;
  category?: string;
  difficulty?: QuestionDifficulty;
  options?: string[];
  createdAt?: Date;
  questionType?: QuestionType;
}

export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  createdAt?: Date;
  updatedAt?: Date;
  logo?: string;
}