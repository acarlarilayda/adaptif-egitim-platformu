export type ExamSessionStatus = 'active' | 'submitted' | 'expired' | 'disconnected';

export interface ExamSession {
  id: string;
  token: string;
  examId: string;
  studentId: string;
  startedAt: string;
  serverReferenceTime: string;
  remainingSeconds: number;
  status: ExamSessionStatus;
  currentQuestionIndex: number;
  flaggedQuestionIds: string[];
  lastSyncedAt: string;
}