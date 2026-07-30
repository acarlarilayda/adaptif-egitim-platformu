import { Injectable, inject } from '@angular/core';
import { CourseRepository } from './course.repository';
import { CourseStore } from '../state/course.store';
import { CreateCourseResult, PublishCourseResult } from '../models/course-operations.model';

@Injectable({ providedIn: 'root' })
export class CourseFacade {
  private readonly repository = inject(CourseRepository);
  private readonly store = inject(CourseStore);

  readonly isLoading = this.store.isLoading;
  readonly hasError = this.store.hasError;
  readonly courses = this.store.courses;

  loadCourses(): void {
    this.store.startLoading();
    this.repository.getCourses().subscribe({
      next: (courses) => this.store.setCourses(courses),
      error: () => this.store.setError(),
    });
  }

  createCourse(title: string, term: string): CreateCourseResult {
    const result = this.repository.createCourse(title, term);
    if (result.success && result.course) {
      this.store.addCourse(result.course);
    }
    return result;
  }

  publish(courseId: string, userId: string): PublishCourseResult {
    const result = this.repository.publish(courseId, userId);
    if (result.success) {
      this.loadCourses();
    }
    return result;
  }
}