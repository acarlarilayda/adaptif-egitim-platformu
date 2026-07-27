export type AuditEventType =
  | 'publish'
  | 'score_change'
  | 'session_terminated'
  | 'override';

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  userId: string;
  targetRecordId: string;
  targetRecordType: string;
  previousValue: string;
  newValue: string;
  reason: string;
  createdAt: string;
}