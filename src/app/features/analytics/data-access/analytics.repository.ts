import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { ItemAnalysis } from '../../../shared/models/item-analysis.model';
import { AuditEvent } from '../../../shared/models/audit-event.model';
import { MOCK_ITEM_ANALYSES } from '../../../core/api/mock-data/item-analyses.mock-data';
import { MOCK_AUDIT_EVENTS } from '../../../core/api/mock-data/audit-events.mock-data';

@Injectable({ providedIn: 'root' })
export class AnalyticsRepository {
  private itemAnalyses: ItemAnalysis[] = [...MOCK_ITEM_ANALYSES];
  private auditEvents: AuditEvent[] = [...MOCK_AUDIT_EVENTS];

  getItemAnalyses(): Observable<ItemAnalysis[]> {
    return mockRequest(() => [...this.itemAnalyses]);
  }

  getAuditEvents(): Observable<AuditEvent[]> {
    return mockRequest(() =>
      [...this.auditEvents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  }
}