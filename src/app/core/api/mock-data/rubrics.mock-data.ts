import { Rubric } from '../../../shared/models/rubric.model';

export const MOCK_RUBRICS: Rubric[] = [
  {
    id: 'rubric-1',
    questionId: 'question-3',
    criteria: [
      {
        id: 'criterion-1',
        title: 'Kavramsal Doğruluk',
        levels: [
          { id: 'level-1', label: 'Yetersiz', points: 0, description: 'Kavram hatalı açıklanmış.' },
          { id: 'level-2', label: 'Kısmen Yeterli', points: 10, description: 'Kavram eksik ama doğru açıklanmış.' },
          { id: 'level-3', label: 'Yeterli', points: 20, description: 'Kavram örneklerle doğru açıklanmış.' },
        ],
      },
    ],
    scoreHistory: [
      {
        criterionId: 'criterion-1',
        previousPoints: 10,
        newPoints: 20,
        reason: 'Öğrenci ek açıklama sundu, puan güncellendi.',
        changedAt: '2025-09-29T11:00:00.000Z',
        changedBy: 'u-instructor-1',
      },
    ],
    createdAt: '2025-09-06T10:00:00.000Z',
    updatedAt: '2025-09-29T11:00:00.000Z',
    version: 2,
  },
];