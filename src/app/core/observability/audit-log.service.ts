import { Injectable, computed, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
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
  private readonly eventStreamSubject = new Subject<AuditEvent>();
  /** Salt okunur, en yeni kayıt en üstte. */
  readonly events = computed(() =>
    [...this.eventsSignal()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  /**
   * Md.8: "En az bir gerçek zamanlı akış WebSocket/SSE simülasyonu veya
   * RxJS event stream ile gösterilmelidir." Her yeni audit kaydı
   * oluştuğunda (sistemin herhangi bir yerinde bir yayın, puan
   * değişikliği vb. olduğunda) bu Observable üzerinden anlık yayınlanır;
   * abone olan ekranlar (örn. audit-log sayfası) bunu gerçek zamanlı
   * bir olay akışı olarak dinleyebilir.
   */
  readonly eventStream$: Observable<AuditEvent> = this.eventStreamSubject.asObservable();

  record(input: RecordAuditEventInput): AuditEvent {
    const event: AuditEvent = {
      id: `audit-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      ...input,
    };
    this.eventsSignal.update((current) => [...current, event]);
    this.eventStreamSubject.next(event);
    return event;
  }

  eventsForRecord(targetRecordId: string): AuditEvent[] {
    return this.events().filter((e) => e.targetRecordId === targetRecordId);
  }
}