import { Injectable, computed, signal } from '@angular/core';
import { AuditEvent, AuditEventType } from '../../shared/models/audit-event.model';
import { MOCK_AUDIT_EVENTS } from '../api/mock-data/audit-events.mock-data';

/**
 * Sistem genelinde tek audit kaynağı. İş Kuralı #11:
 * her yayın, puan değişikliği, oturum sonlandırma ve override
 * bu servis üzerinden kaydedilmelidir.
 *
 * Feature repository'leri doğrudan AuditEvent oluşturmamalı;
 * bu servisi enjekte edip `record(...)` çağırmalıdır.
 */
export interface RecordAuditEventInput {
  type: AuditEventType;
  userId: string;
  targetRecordId: string;
  targetRecordType: string;
  previousValue: string;
  newValue: string;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly eventsSignal = signal<AuditEvent[]>([...MOCK_AUDIT_EVENTS]);

  /** Salt okunur, en yeni kayıt en üstte. */
  readonly events = computed(() =>
    [...this.eventsSignal()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  record(input: RecordAuditEventInput): AuditEvent {
    const event: AuditEvent = {
      id: `audit-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    this.eventsSignal.update((current) => [...current, event]);
    return event;
  }

  eventsForRecord(targetRecordId: string): AuditEvent[] {
    return this.events().filter((e) => e.targetRecordId === targetRecordId);
  }
}