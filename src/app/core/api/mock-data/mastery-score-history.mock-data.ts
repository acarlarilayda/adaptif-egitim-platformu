import { MasteryScore } from '../../../shared/models/mastery-score.model';

/**
 * MOCK_MASTERY_SCORES (analytics.repository) kohort/güncel durum hesapları
 * için "öğrenci başına tek güncel skor" varsayımıyla kullanılır; bu diziye
 * dokunursak o hesaplar bozulur. MasteryHeatmap ise zaman içindeki
 * ilerlemeyi göstermesi gerektiğinden, ayrı ve bağımsız bir geçmiş veri
 * seti kullanıyoruz.
 */
export const MOCK_MASTERY_SCORE_HISTORY: MasteryScore[] = [
  {
    id: 'mastery-hist-1',
    studentId: 'u-student-1',
    outcomeId: 'outcome-1',
    score: 55,
    inputs: { recentAnswerCorrectCount: 4, recentAnswerTotalCount: 8, averageDifficulty: 1.0, attemptCount: 1 },
    calculatedAt: '2025-09-12T08:00:00.000Z',
  },
  {
    id: 'mastery-hist-2',
    studentId: 'u-student-1',
    outcomeId: 'outcome-1',
    score: 68,
    inputs: { recentAnswerCorrectCount: 6, recentAnswerTotalCount: 9, averageDifficulty: 1.1, attemptCount: 2 },
    calculatedAt: '2025-09-26T08:00:00.000Z',
  },
  {
    id: 'mastery-hist-3',
    studentId: 'u-student-1',
    outcomeId: 'outcome-1',
    score: 76,
    inputs: { recentAnswerCorrectCount: 7, recentAnswerTotalCount: 9, averageDifficulty: 1.1, attemptCount: 2 },
    calculatedAt: '2025-10-03T08:00:00.000Z',
  },
  {
    id: 'mastery-hist-4',
    studentId: 'u-student-1',
    outcomeId: 'outcome-1',
    score: 85,
    inputs: { recentAnswerCorrectCount: 8, recentAnswerTotalCount: 10, averageDifficulty: 1.2, attemptCount: 2 },
    calculatedAt: '2025-10-10T08:00:00.000Z',
  },
  {
    id: 'mastery-hist-5',
    studentId: 'u-student-1',
    outcomeId: 'outcome-2',
    score: 30,
    inputs: { recentAnswerCorrectCount: 1, recentAnswerTotalCount: 4, averageDifficulty: 1.6, attemptCount: 1 },
    calculatedAt: '2025-09-12T08:00:00.000Z',
  },
  {
    id: 'mastery-hist-6',
    studentId: 'u-student-1',
    outcomeId: 'outcome-2',
    score: 33,
    inputs: { recentAnswerCorrectCount: 2, recentAnswerTotalCount: 6, averageDifficulty: 1.7, attemptCount: 1 },
    calculatedAt: '2025-09-26T08:00:00.000Z',
  },
  {
    id: 'mastery-hist-7',
    studentId: 'u-student-1',
    outcomeId: 'outcome-2',
    score: 36,
    inputs: { recentAnswerCorrectCount: 2, recentAnswerTotalCount: 5, averageDifficulty: 1.7, attemptCount: 1 },
    calculatedAt: '2025-10-03T08:00:00.000Z',
  },
  {
    id: 'mastery-hist-8',
    studentId: 'u-student-1',
    outcomeId: 'outcome-2',
    score: 40,
    inputs: { recentAnswerCorrectCount: 2, recentAnswerTotalCount: 5, averageDifficulty: 1.8, attemptCount: 1 },
    calculatedAt: '2025-10-10T08:00:00.000Z',
  },
];