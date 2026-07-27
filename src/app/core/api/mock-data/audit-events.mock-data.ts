import { AuditEvent } from '../../../shared/models/audit-event.model';

export const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'audit-1',
    type: 'publish',
    userId: 'u-program-1',
    targetRecordId: 'exam-1',
    targetRecordType: 'Exam',
    previousValue: 'draft',
    newValue: 'published',
    reason: 'Blueprint kısıtları karşılandı, sınav yayına alındı.',
    createdAt: '2025-09-25T10:05:00.000Z',
  },
  {
    id: 'audit-2',
    type: 'score_change',
    userId: 'u-instructor-1',
    targetRecordId: 'rubric-1',
    targetRecordType: 'Rubric',
    previousValue: '10',
    newValue: '20',
    reason: 'Öğrenci ek açıklama sundu, puan güncellendi.',
    createdAt: '2025-09-29T11:00:00.000Z',
  },
  {
    id: 'audit-3',
    type: 'session_terminated',
    userId: 'u-student-1',
    targetRecordId: 'session-2',
    targetRecordType: 'ExamSession',
    previousValue: 'active',
    newValue: 'submitted',
    reason: 'Öğrenci sınavı süresinde tamamladı.',
    createdAt: '2025-09-28T09:40:00.000Z',
  },
];