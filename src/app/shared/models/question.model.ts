export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionPublishStatus = 'draft' | 'published' | 'retired';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  outcomeId: string;
  stem: string;
  options: QuestionOption[];
  solutionExplanation: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  points: number;
  publishStatus: QuestionPublishStatus;
  currentVersionId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}