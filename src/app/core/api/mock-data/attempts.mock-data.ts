import { Attempt } from '../../../shared/models/attempt.model';

export const MOCK_ATTEMPTS: Attempt[] = [
  {
    id: 'attempt-1',
    examId: 'exam-1',
    studentId: 'u-student-1',
    sessionId: 'session-2',
    answers: [
      { questionId: 'question-1', answerValue: 'opt-2', awardedPoints: 10, maxPoints: 10 },
      { questionId: 'question-2', answerValue: 'opt-6', awardedPoints: 0, maxPoints: 5 },
    ],
    totalScore: 10,
    status: 'graded',
    submittedAt: '2025-09-28T09:40:00.000Z',
    createdAt: '2025-09-28T09:00:00.000Z',
    updatedAt: '2025-09-28T10:00:00.000Z',
    version: 1,
  },
];