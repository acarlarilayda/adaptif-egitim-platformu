import { AnswerDraft } from '../../../shared/models/answer-draft.model';

export const MOCK_ANSWER_DRAFTS: AnswerDraft[] = [
  {
    id: 'draft-1',
    sessionId: 'session-1',
    questionId: 'question-1',
    answerValue: 'opt-2',
    autosaveVersion: 3,
    syncStatus: 'synced',
    savedAt: '2025-10-10T09:12:00.000Z',
  },
  {
    id: 'draft-2',
    sessionId: 'session-1',
    questionId: 'question-2',
    answerValue: 'opt-5',
    autosaveVersion: 1,
    syncStatus: 'conflict',
    savedAt: '2025-10-10T09:14:30.000Z',
  },
];