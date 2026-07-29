import { Injectable, computed, signal } from '@angular/core';
import { Course } from '../../../shared/models/course.model';
import { LearningOutcome } from '../../../shared/models/learning-outcome.model';
import { CourseWithOutcomes } from '../models/outcome-view.model';

@Injectable({ providedIn: 'root' })
export class OutcomeStore {
  private readonly _courses = signal<Course[]>([]);
  private readonly _outcomes = signal<LearningOutcome[]>([]);
  private readonly _isLoading = signal(true);
  private readonly _hasError = signal(false);

  readonly courses = this._courses.asReadonly();
  readonly outcomes = this._outcomes.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly hasError = this._hasError.asReadonly();

  readonly groups = computed<CourseWithOutcomes[]>(() =>
    this._courses().map((course) => ({
      course,
      outcomes: this._outcomes().filter((outcome) => outcome.courseId === course.id),
    }))
  );

  startLoading(): void {
    this._isLoading.set(true);
    this._hasError.set(false);
  }

  setData(courses: Course[], outcomes: LearningOutcome[]): void {
    this._courses.set(courses);
    this._outcomes.set(outcomes);
    this._isLoading.set(false);
    this._hasError.set(false);
  }

  setLoadError(): void {
    this._isLoading.set(false);
    this._hasError.set(true);
  }
}
