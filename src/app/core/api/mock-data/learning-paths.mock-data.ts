import { LearningPath } from '../../../shared/models/learning-path.model';

export const MOCK_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-1',
    studentId: 'u-student-1',
    courseId: 'course-1',
    steps: [
      {
        contentItemId: 'content-1',
        order: 1,
        reason: 'Doğal Sayılarla İşlemler kazanımında henüz ustalık gösterilmedi.',
        isCompleted: true,
        isLocked: false,
      },
      {
        contentItemId: 'content-2',
        order: 2,
        reason: 'Bir önceki kazanım tamamlandı, sıradaki kazanıma geçiliyor.',
        isCompleted: false,
        isLocked: false,
      },
      {
        contentItemId: 'content-3',
        order: 3,
        reason: 'Rasyonel Sayılar kazanımı henüz tamamlanmadığı için kilitli.',
        isCompleted: false,
        isLocked: true,
      },
    ],
    generatedAt: '2025-10-01T07:00:00.000Z',
    updatedAt: '2025-10-05T07:00:00.000Z',
  },
];