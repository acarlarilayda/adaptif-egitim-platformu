import { ExamSession } from '../../../shared/models/exam-session.model';

export const MOCK_EXAM_SESSIONS: ExamSession[] = [
  {
    id: 'session-1',
    token: 'tok-abc123',
    examId: 'exam-1',
    studentId: 'u-student-1',
    startedAt: '2025-10-10T09:00:00.000Z',
    serverReferenceTime: '2025-10-10T09:15:00.000Z',
    remainingSeconds: 1500,
    status: 'active',
    currentQuestionIndex: 1,
    flaggedQuestionIds: ['question-2'],
    lastSyncedAt: '2025-10-10T09:15:00.000Z',
  },
  {
    id: 'session-2',
    token: 'tok-def456',
    examId: 'exam-1',
    studentId: 'u-student-1',
    startedAt: '2025-09-28T09:00:00.000Z',
    serverReferenceTime: '2025-09-28T09:40:00.000Z',
    remainingSeconds: 0,
    status: 'submitted',
    currentQuestionIndex: 2,
    flaggedQuestionIds: [],
    lastSyncedAt: '2025-09-28T09:40:00.000Z',
  },
];