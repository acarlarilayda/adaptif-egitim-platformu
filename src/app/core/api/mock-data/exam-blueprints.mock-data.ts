import { ExamBlueprint } from '../../../shared/models/exam-blueprint.model';

export const MOCK_EXAM_BLUEPRINTS: ExamBlueprint[] = [
  {
    id: 'blueprint-1',
    title: 'Matematik 1. Dönem Ara Sınavı Taslağı',
    courseId: 'course-1',
    constraints: [
      {
        outcomeId: 'outcome-1',
        difficulty: 'easy',
        questionType: 'multiple_choice',
        requiredCount: 2,
        requiredPoints: 20,
      },
      {
        outcomeId: 'outcome-2',
        difficulty: 'medium',
        questionType: 'true_false',
        requiredCount: 1,
        requiredPoints: 5,
      },
    ],
    totalPoints: 25,
    createdAt: '2025-09-20T10:00:00.000Z',
    updatedAt: '2025-09-20T10:00:00.000Z',
    version: 1,
  },
];