export type AnswerSyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export interface AnswerDraft {
  id: string;
  sessionId: string;
  questionId: string;
  answerValue: string | string[];
  autosaveVersion: number;
  syncStatus: AnswerSyncStatus;
  savedAt: string;
}