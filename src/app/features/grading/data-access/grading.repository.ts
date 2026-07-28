import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { Attempt } from '../../../shared/models/attempt.model';
import { Rubric, RubricScoreChange } from '../../../shared/models/rubric.model';
import { MOCK_ATTEMPTS } from '../../../core/api/mock-data/attempts.mock-data';
import { MOCK_RUBRICS } from '../../../core/api/mock-data/rubrics.mock-data';
import { AuditLogService } from '../../../core/observability/audit-log.service';

@Injectable({ providedIn: 'root' })
export class GradingRepository {
  private readonly auditLog = inject(AuditLogService);

  private attempts: Attempt[] = [...MOCK_ATTEMPTS];
  private rubrics: Rubric[] = MOCK_RUBRICS.map((r) => ({
    ...r,
    criteria: r.criteria.map((c) => ({ ...c, levels: c.levels.map((l) => ({ ...l })) })),
    scoreHistory: [...r.scoreHistory],
  }));

  getAttempts(): Observable<Attempt[]> {
    return mockRequest(() => [...this.attempts]);
  }

  getRubricForQuestion(questionId: string): Observable<Rubric | undefined> {
    return mockRequest(() => this.rubrics.find((r) => r.questionId === questionId));
  }

  /**
   * Rubrik puan değişikliğinde gerekçe zorunludur.
   * Gerekçe boşsa işlemi reddeder. Her puan değişikliği/override
   * audit event üretir.
   */
  updateCriterionScore(
    rubricId: string,
    criterionId: string,
    newPoints: number,
    reason: string,
    changedBy: string
  ): Observable<Rubric | undefined> {
    return mockRequest(() => {
      if (!reason || reason.trim().length === 0) {
        throw new Error('Puan değişikliği için gerekçe zorunludur.');
      }

      const rubric = this.rubrics.find((r) => r.id === rubricId);
      if (!rubric) {
        return undefined;
      }

      const criterion = rubric.criteria.find((c) => c.id === criterionId);
      if (!criterion) {
        return undefined;
      }

      const previousChange = rubric.scoreHistory
        .filter((h) => h.criterionId === criterionId)
        .at(-1);
      const previousPoints = previousChange ? previousChange.newPoints : 0;
      const isOverride = !!previousChange;

      const change: RubricScoreChange = {
        criterionId,
        previousPoints,
        newPoints,
        reason,
        changedAt: new Date().toISOString(),
        changedBy,
      };

      this.rubrics = this.rubrics.map((r) =>
        r.id === rubricId
          ? {
              ...r,
              scoreHistory: [...r.scoreHistory, change],
              updatedAt: new Date().toISOString(),
              version: r.version + 1,
            }
          : r
      );

      this.auditLog.record({
        type: isOverride ? 'override' : 'score_change',
        userId: changedBy,
        targetRecordId: rubricId,
        targetRecordType: 'Rubric',
        previousValue: String(previousPoints),
        newValue: String(newPoints),
        reason,
      });

      return this.rubrics.find((r) => r.id === rubricId);
    });
  }
}