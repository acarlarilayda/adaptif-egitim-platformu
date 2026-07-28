import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { Course } from '../../../shared/models/course.model';
import { LearningOutcome } from '../../../shared/models/learning-outcome.model';
import { MOCK_COURSES } from '../../../core/api/mock-data/courses.mock-data';
import { MOCK_LEARNING_OUTCOMES } from '../../../core/api/mock-data/learning-outcomes.mock-data';
import { AuditLogService } from '../../../core/observability/audit-log.service';

export interface AddPrerequisiteResult {
  success: boolean;
  error?: 'cycle' | 'not_found';
}

export interface PublishOutcomeResult {
  success: boolean;
  error?: 'not_found' | 'unpublished_prerequisite';
  /** error === 'unpublished_prerequisite' olduğunda, yayınlanmamış önkoşulların id listesi. */
  unpublishedPrerequisiteIds?: string[];
}

@Injectable({ providedIn: 'root' })
export class OutcomeRepository {
  private readonly auditLog = inject(AuditLogService);

  // Gerçek bir backend olmadığından, veriler bellek içinde kopya olarak tutulur.
  private courses: Course[] = [...MOCK_COURSES];
  private outcomes: LearningOutcome[] = MOCK_LEARNING_OUTCOMES.map((o) => ({
    ...o,
    prerequisiteIds: [...o.prerequisiteIds],
  }));

  getCourses(): Observable<Course[]> {
    return mockRequest(() => [...this.courses]);
  }

  getOutcomesByCourse(courseId: string): Observable<LearningOutcome[]> {
    return mockRequest(() =>
      this.outcomes.filter((outcome) => outcome.courseId === courseId)
    );
  }

  getAllOutcomes(): Observable<LearningOutcome[]> {
    return mockRequest(() => [...this.outcomes]);
  }

  getOutcomeById(id: string): Observable<LearningOutcome | undefined> {
    return mockRequest(() => this.outcomes.find((o) => o.id === id)).pipe(
      map((outcome) => outcome)
    );
  }

  /**
   * Yeni bir önkoşul ilişkisi eklemeden önce döngü oluşup oluşmayacağını kontrol eder.
   */
  wouldCreateCycle(outcomeId: string, newPrerequisiteId: string): boolean {
    if (outcomeId === newPrerequisiteId) {
      return true;
    }

    const visited = new Set<string>();
    const stack = [newPrerequisiteId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (currentId === outcomeId) {
        return true;
      }
      if (visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);

      const current = this.outcomes.find((o) => o.id === currentId);
      if (current) {
        stack.push(...current.prerequisiteIds);
      }
    }

    return false;
  }

  /**
   * İş Kuralı #1: Kazanım önkoşul grafiğinde döngü bulunamaz.
   * Döngü oluşacaksa ekleme reddedilir.
   */
  addPrerequisite(outcomeId: string, prerequisiteId: string): AddPrerequisiteResult {
    const outcome = this.outcomes.find((o) => o.id === outcomeId);
    const prerequisite = this.outcomes.find((o) => o.id === prerequisiteId);

    if (!outcome || !prerequisite) {
      return { success: false, error: 'not_found' };
    }

    if (this.wouldCreateCycle(outcomeId, prerequisiteId)) {
      return { success: false, error: 'cycle' };
    }

    if (!outcome.prerequisiteIds.includes(prerequisiteId)) {
      this.outcomes = this.outcomes.map((o) =>
        o.id === outcomeId
          ? {
              ...o,
              prerequisiteIds: [...o.prerequisiteIds, prerequisiteId],
              updatedAt: new Date().toISOString(),
              version: o.version + 1,
            }
          : o
      );
    }

    return { success: true };
  }

  /**
   * Doküman Md.4: "Döngüsel önkoşul ve yayınlanmamış bağlı kazanım kontrol edilmelidir."
   * İş Kuralı #11: Her yayın audit event üretmelidir.
   */
  publish(outcomeId: string, userId: string): PublishOutcomeResult {
    const outcome = this.outcomes.find((o) => o.id === outcomeId);
    if (!outcome) {
      return { success: false, error: 'not_found' };
    }

    const unpublishedPrerequisiteIds = outcome.prerequisiteIds.filter((prereqId) => {
      const prereq = this.outcomes.find((o) => o.id === prereqId);
      return !!prereq && !prereq.isPublished;
    });

    if (unpublishedPrerequisiteIds.length > 0) {
      return { success: false, error: 'unpublished_prerequisite', unpublishedPrerequisiteIds };
    }

    const previousValue = outcome.isPublished ? 'published' : 'draft';

    this.outcomes = this.outcomes.map((o) =>
      o.id === outcomeId
        ? { ...o, isPublished: true, updatedAt: new Date().toISOString(), version: o.version + 1 }
        : o
    );

    this.auditLog.record({
      type: 'publish',
      userId,
      targetRecordId: outcome.id,
      targetRecordType: 'LearningOutcome',
      previousValue,
      newValue: 'published',
      reason: `"${outcome.title}" kazanımı yayına alındı.`,
    });

    return { success: true };
  }
}