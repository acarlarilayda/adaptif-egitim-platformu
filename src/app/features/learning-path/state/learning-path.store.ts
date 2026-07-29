import { Injectable, signal } from '@angular/core';
import { PathStepWithContent } from '../models/learning-path-view.model';

@Injectable({ providedIn: 'root' })
export class LearningPathStore {
  private readonly _steps = signal<PathStepWithContent[]>([]);
  private readonly _isLoading = signal(true);
  private readonly _hasError = signal(false);

  readonly steps = this._steps.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly hasError = this._hasError.asReadonly();

  startLoading(): void {
    this._isLoading.set(true);
    this._hasError.set(false);
  }

  setSteps(steps: PathStepWithContent[]): void {
    this._steps.set(steps);
    this._isLoading.set(false);
    this._hasError.set(false);
  }

  setError(): void {
    this._isLoading.set(false);
    this._hasError.set(true);
  }
}