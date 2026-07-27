import { Course } from '../../../shared/models/course.model';

export const MOCK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Matematik 9. Sınıf',
    term: '2025-2026 Güz',
    instructorId: 'u-instructor-1',
    publishStatus: 'published',
    outcomeIds: ['outcome-1', 'outcome-2', 'outcome-3'],
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
    version: 1,
  },
  {
    id: 'course-2',
    title: 'Fizik 9. Sınıf',
    term: '2025-2026 Güz',
    instructorId: 'u-instructor-1',
    publishStatus: 'published',
    outcomeIds: ['outcome-4', 'outcome-5'],
    createdAt: '2025-09-02T08:00:00.000Z',
    updatedAt: '2025-09-02T08:00:00.000Z',
    version: 1,
  },
  {
    id: 'course-3',
    title: 'Kimya 10. Sınıf',
    term: '2025-2026 Güz',
    instructorId: 'u-instructor-1',
    publishStatus: 'draft',
    outcomeIds: ['outcome-6'],
    createdAt: '2025-09-10T08:00:00.000Z',
    updatedAt: '2025-09-15T08:00:00.000Z',
    version: 2,
  },
];