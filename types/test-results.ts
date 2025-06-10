export interface TestResults {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  questionResults: QuestionResult[];
  flaggedQuestions: number[];
}

export interface QuestionResult {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}