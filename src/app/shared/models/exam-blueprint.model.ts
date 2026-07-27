import { QuestionDifficulty, QuestionType } from './question.model';

export interface BlueprintConstraint {
  outcomeId: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  requiredCount: number;
  requiredPoints: number;
}

export interface ExamBlueprint {
  id: string;
  title: string;
  courseId: string;
  constraints: BlueprintConstraint[];
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
  version: number;
}