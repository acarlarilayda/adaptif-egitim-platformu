export interface LearningPathStep {
  contentItemId: string;
  order: number;
  reason: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface LearningPath {
  id: string;
  studentId: string;
  courseId: string;
  steps: LearningPathStep[];
  generatedAt: string;
  updatedAt: string;
}