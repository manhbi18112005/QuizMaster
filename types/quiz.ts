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
}

export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  createdAt?: Date;
  updatedAt?: Date;
}