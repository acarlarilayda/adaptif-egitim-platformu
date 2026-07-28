import { TestBed } from '@angular/core/testing';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditLogService);
  });

  it('başlangıçta mock audit kayıtlarını yükler', () => {
    expect(service.events().length).toBeGreaterThan(0);
  });

  it('record() yeni bir audit event ekler ve id/createdAt üretir', () => {
    const before = service.events().length;

    const created = service.record({
      type: 'publish',
      userId: 'u-test-1',
      targetRecordId: 'outcome-99',
      targetRecordType: 'LearningOutcome',
      previousValue: 'draft',
      newValue: 'published',
      reason: 'Test amaçlı yayın.',
    });

    expect(service.events().length).toBe(before + 1);
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
  });

  it('en yeni event en üstte gelecek şekilde sıralar', () => {
    service.record({
      type: 'override',
      userId: 'u-test-2',
      targetRecordId: 'rubric-99',
      targetRecordType: 'Rubric',
      previousValue: '5',
      newValue: '8',
      reason: 'Sıralama testi.',
    });

    const [latest] = service.events();
    expect(latest.targetRecordId).toBe('rubric-99');
  });

  it('eventsForRecord() sadece ilgili kaydın audit geçmişini döner', () => {
    service.record({
      type: 'score_change',
      userId: 'u-test-3',
      targetRecordId: 'attempt-99',
      targetRecordType: 'Attempt',
      previousValue: '70',
      newValue: '85',
      reason: 'Filtre testi.',
    });

    const filtered = service.eventsForRecord('attempt-99');
    expect(filtered.every((e) => e.targetRecordId === 'attempt-99')).toBe(true);
  });
});