import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { Attempt } from '../../../shared/models/attempt.model';
import { Rubric, RubricScoreChange } from '../../../shared/models/rubric.model';
import { MOCK_ATTEMPTS } from '../../../core/api/mock-data/attempts.mock-data';
import { MOCK_RUBRICS } from '../../../core/api/mock-data/rubrics.mock-data';

@Injectable({ providedIn: 'root' })
export class GradingRepository {
  private attempts: Attempt[] = [...MOCK_ATTEMPTS];
  private rubrics: Rubric[] = [...MOCK_RUBRICS];

  getAttempts(): Observable<Attempt[]> {
    return mockRequest(() => [...this.attempts]);
  }

  getRubricForQuestion(questionId: string): Observable<Rubric | undefined> {
    return mockRequest(() => this.rubrics.find((r) => r.questionId === questionId));
  }

  /**
   * Rubrik puan değişikliğinde gerekçe zorunludur.
   * Gerekçe boşsa işlemi reddeder.
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

      const change: RubricScoreChange = {
        criterionId,
        previousPoints,
        newPoints,
        reason,
        changedAt: new Date().toISOString(),
        changedBy,
      };

      rubric.scoreHistory.push(change);
      rubric.updatedAt = new Date().toISOString();
      rubric.version += 1;

      return rubric;
    });
  }
}