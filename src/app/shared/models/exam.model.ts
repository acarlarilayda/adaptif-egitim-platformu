export type ExamPublishStatus = 'draft' | 'published' | 'archived';

export interface ExamRules {
  durationMinutes: number;
  allowNavigationBack: boolean;
  shuffleQuestions: boolean;
  maxAttempts: number;
}

export interface Exam {
  id: string;
  title: string;
  courseId: string;
  blueprintId: string;
  questionIds: string[];
  rules: ExamRules;
  publishStatus: ExamPublishStatus;
  createdAt: string;
  updatedAt: string;
  version: number;
}