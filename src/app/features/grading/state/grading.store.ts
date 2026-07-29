import { Injectable, signal } from '@angular/core';
import { Attempt } from '../../../shared/models/attempt.model';
import { Rubric } from '../../../shared/models/rubric.model';

@Injectable({ providedIn: 'root' })
export class GradingStore {
  private readonly _attempts = signal<Attempt[]>([]);
  private readonly _isListLoading = signal(true);
  private readonly _hasListError = signal(false);

  private readonly _selectedAttempt = signal<Attempt | null>(null);
  private readonly _isDetailLoading = signal(true);
  private readonly _hasDetailError = signal(false);

  private readonly _rubricsByQuestionId = signal<Record<string, Rubric>>({});

  readonly attempts = this._attempts.asReadonly();
  readonly isListLoading = this._isListLoading.asReadonly();
  readonly hasListError = this._hasListError.asReadonly();

  readonly selectedAttempt = this._selectedAttempt.asReadonly();
  readonly isDetailLoading = this._isDetailLoading.asReadonly();
  readonly hasDetailError = this._hasDetailError.asReadonly();

  readonly rubricsByQuestionId = this._rubricsByQuestionId.asReadonly();

  startListLoading(): void {
    this._isListLoading.set(true);
    this._hasListError.set(false);
  }

  setAttempts(attempts: Attempt[]): void {
    this._attempts.set(attempts);
    this._isListLoading.set(false);
    this._hasListError.set(false);
  }

  setListError(): void {
    this._isListLoading.set(false);
    this._hasListError.set(true);
  }

  startDetailLoading(): void {
    this._isDetailLoading.set(true);
    this._hasDetailError.set(false);
  }

  setSelectedAttempt(attempt: Attempt): void {
    this._selectedAttempt.set(attempt);
    this._isDetailLoading.set(false);
    this._hasDetailError.set(false);
  }

  setDetailError(): void {
    this._isDetailLoading.set(false);
    this._hasDetailError.set(true);
  }

  setRubric(rubric: Rubric): void {
    this._rubricsByQuestionId.update((current) => ({ ...current, [rubric.questionId]: rubric }));
  }
}