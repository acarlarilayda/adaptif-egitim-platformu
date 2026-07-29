import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LearningPathRepository } from './learning-path.repository';
import { PathStepWithContent } from '../models/learning-path-view.model';
import { LearningPathStore } from '../state/learning-path.store';

@Injectable({ providedIn: 'root' })
export class LearningPathFacade {
  private readonly repository = inject(LearningPathRepository);
  private readonly store = inject(LearningPathStore);

  readonly steps = this.store.steps;
  readonly isLoading = this.store.isLoading;
  readonly hasError = this.store.hasError;

  loadPathForStudent(studentId: string): void {
    this.store.startLoading();
    this.repository.getPathForStudent(studentId).subscribe({
      next: (steps) => this.store.setSteps(steps),
      error: () => this.store.setError(),
    });
  }

  /** Öğrenme özet panosu gibi başka feature'ların ham veriye ihtiyaç duyduğu durumlar için pass-through. */
  getPathForStudent(studentId: string): Observable<PathStepWithContent[]> {
    return this.repository.getPathForStudent(studentId);
  }
}