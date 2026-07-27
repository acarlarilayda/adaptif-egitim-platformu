import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { Course } from '../../../shared/models/course.model';
import { LearningOutcome } from '../../../shared/models/learning-outcome.model';
import { MOCK_COURSES } from '../../../core/api/mock-data/courses.mock-data';
import { MOCK_LEARNING_OUTCOMES } from '../../../core/api/mock-data/learning-outcomes.mock-data';

@Injectable({ providedIn: 'root' })
export class OutcomeRepository {
  // Gerçek bir backend olmadığından, veriler bellek içinde kopya olarak tutulur.
  private courses: Course[] = [...MOCK_COURSES];
  private outcomes: LearningOutcome[] = [...MOCK_LEARNING_OUTCOMES];

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
}