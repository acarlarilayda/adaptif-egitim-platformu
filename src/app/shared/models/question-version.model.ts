import { QuestionOption, QuestionType, QuestionDifficulty } from './question.model';

export interface QuestionVersion {
  id: string;
  questionId: string;
  versionNumber: number;
  type: QuestionType;
  stem: string;
  options: QuestionOption[];
  difficulty: QuestionDifficulty;
  points: number;
  changeNote: string;
  createdAt: string;
}