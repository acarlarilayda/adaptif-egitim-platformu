import { Recommendation } from '../../../shared/models/recommendation.model';

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    studentId: 'u-student-1',
    targetType: 'content_item',
    targetId: 'content-2',
    outcomeId: 'outcome-2',
    reason: 'Rasyonel Sayılar kazanımında ustalık skoru düşük (%40), tekrar önerildi.',
    masteryScoreAtTime: 40,
    createdAt: '2025-10-10T08:05:00.000Z',
    isDismissed: false,
  },
  {
    id: 'rec-2',
    studentId: 'u-student-1',
    targetType: 'question',
    targetId: 'question-1',
    outcomeId: 'outcome-1',
    reason: 'Doğal Sayılarla İşlemler kazanımı güçlü, pekiştirme amaçlı ileri soru önerildi.',
    masteryScoreAtTime: 85,
    createdAt: '2025-10-10T08:05:00.000Z',
    isDismissed: true,
  },
];