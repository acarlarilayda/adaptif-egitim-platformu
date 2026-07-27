export interface RubricLevel {
  id: string;
  label: string;
  points: number;
  description: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  levels: RubricLevel[];
}

export interface RubricScoreChange {
  criterionId: string;
  previousPoints: number;
  newPoints: number;
  reason: string;
  changedAt: string;
  changedBy: string;
}

export interface Rubric {
  id: string;
  questionId: string;
  criteria: RubricCriterion[];
  scoreHistory: RubricScoreChange[];
  createdAt: string;
  updatedAt: string;
  version: number;
}