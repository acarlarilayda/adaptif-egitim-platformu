export type AttemptStatus = 'in_progress' | 'submitted' | 'graded' | 'regraded';

export interface AttemptAnswer {
  questionId: string;
  answerValue: string | string[];
  awardedPoints: number;
  maxPoints: number;
}

export interface Attempt {
  id: string;
  examId: string;
  studentId: string;
  sessionId: string;
  answers: AttemptAnswer[];
  totalScore: number;
  status: AttemptStatus;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}