export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | undefined;

export interface Question {
  id: string;
  question: string;
  choices: string[];
  answers: string[];
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