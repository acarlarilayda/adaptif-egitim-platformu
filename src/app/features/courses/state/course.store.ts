import { Injectable, computed, signal } from '@angular/core';
import { Course } from '../../../shared/models/course.model';

@Injectable({ providedIn: 'root' })
export class CourseStore {
  private readonly coursesSignal = signal<Course[]>([]);
  private readonly loadingSignal = signal(true);
  private readonly errorSignal = signal(false);

  readonly courses = computed(() => this.coursesSignal());
  readonly isLoading = computed(() => this.loadingSignal());
  readonly hasError = computed(() => this.errorSignal());

  startLoading(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(false);
  }

  setCourses(courses: Course[]): void {
    this.coursesSignal.set(courses);
    this.loadingSignal.set(false);
  }

  setError(): void {
    this.errorSignal.set(true);
    this.loadingSignal.set(false);
  }

  addCourse(course: Course): void {
    this.coursesSignal.update((current) => [...current, course]);
  }

  updateCourse(updated: Course): void {
    this.coursesSignal.update((current) =>
      current.map((c) => (c.id === updated.id ? updated : c))
    );
  }
}