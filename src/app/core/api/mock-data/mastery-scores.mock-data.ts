import { MasteryScore } from '../../../shared/models/mastery-score.model';

export const MOCK_MASTERY_SCORES: MasteryScore[] = [
  {
    id: 'mastery-1',
    studentId: 'u-student-1',
    outcomeId: 'outcome-1',
    score: 85,
    inputs: {
      recentAnswerCorrectCount: 8,
      recentAnswerTotalCount: 10,
      averageDifficulty: 1.2,
      attemptCount: 2,
    },
    calculatedAt: '2025-10-10T08:00:00.000Z',
  },
  {
    id: 'mastery-2',
    studentId: 'u-student-1',
    outcomeId: 'outcome-2',
    score: 40,
    inputs: {
      recentAnswerCorrectCount: 2,
      recentAnswerTotalCount: 5,
      averageDifficulty: 1.8,
      attemptCount: 1,
    },
    calculatedAt: '2025-10-10T08:00:00.000Z',
  },
];