import { Injectable, signal } from '@angular/core';
import { Question } from '../../../shared/models/question.model';
import { QuestionVersion } from '../../../shared/models/question-version.model';

@Injectable({ providedIn: 'root' })
export class QuestionStore {
  private readonly _questions = signal<Question[]>([]);
  private readonly _isListLoading = signal(true);
  private readonly _hasListError = signal(false);

  private readonly _selectedQuestion = signal<Question | null>(null);
  private readonly _selectedVersions = signal<QuestionVersion[]>([]);
  private readonly _isDetailLoading = signal(true);
  private readonly _hasDetailError = signal(false);

  readonly questions = this._questions.asReadonly();
  readonly isListLoading = this._isListLoading.asReadonly();
  readonly hasListError = this._hasListError.asReadonly();

  readonly selectedQuestion = this._selectedQuestion.asReadonly();
  readonly selectedVersions = this._selectedVersions.asReadonly();
  readonly isDetailLoading = this._isDetailLoading.asReadonly();
  readonly hasDetailError = this._hasDetailError.asReadonly();

  startListLoading(): void {
    this._isListLoading.set(true);
    this._hasListError.set(false);
  }

  setQuestions(questions: Question[]): void {
    this._questions.set(questions);
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

  setDetail(question: Question, versions: QuestionVersion[]): void {
    this._selectedQuestion.set(question);
    this._selectedVersions.set([...versions].sort((a, b) => b.versionNumber - a.versionNumber));
    this._isDetailLoading.set(false);
    this._hasDetailError.set(false);
  }

  setDetailError(): void {
    this._isDetailLoading.set(false);
    this._hasDetailError.set(true);
  }
}