import { Exam } from '../../../shared/models/exam.model';

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    title: 'Matematik 1. Dönem Ara Sınavı',
    courseId: 'course-1',
    blueprintId: 'blueprint-1',
    questionIds: ['question-1', 'question-2'],
    rules: {
      durationMinutes: 40,
      allowNavigationBack: true,
      shuffleQuestions: true,
      maxAttempts: 1,
    },
    publishStatus: 'published',
    createdAt: '2025-09-25T10:00:00.000Z',
    updatedAt: '2025-09-25T10:00:00.000Z',
    version: 1,
  },
  {
    id: 'exam-2',
    title: 'Fizik Kısa Sınav',
    courseId: 'course-2',
    blueprintId: 'blueprint-1',
    questionIds: ['question-3'],
    rules: {
      durationMinutes: 20,
      allowNavigationBack: false,
      shuffleQuestions: false,
      maxAttempts: 1,
    },
    publishStatus: 'draft',
    createdAt: '2025-09-28T10:00:00.000Z',
    updatedAt: '2025-09-28T10:00:00.000Z',
    version: 1,
  },
];