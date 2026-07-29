import { Injectable, signal } from '@angular/core';
import { Exam } from '../../../shared/models/exam.model';
import { Question } from '../../../shared/models/question.model';
import { ExamSession } from '../../../shared/models/exam-session.model';
import { AnswerDraft } from '../../../shared/models/answer-draft.model';

@Injectable({ providedIn: 'root' })
export class ExamSessionStore {
  private readonly _isLoading = signal(true);
  private readonly _hasError = signal(false);

  private readonly _exam = signal<Exam | null>(null);
  private readonly _questions = signal<Question[]>([]);
  private readonly _session = signal<ExamSession | null>(null);

  private readonly _answers = signal<Record<string, string>>({});
  private readonly _answerVersions = signal<Record<string, number>>({});
  private readonly _saveStatus = signal<Record<string, AnswerDraft['syncStatus']>>({});

  readonly isLoading = this._isLoading.asReadonly();
  readonly hasError = this._hasError.asReadonly();
  readonly exam = this._exam.asReadonly();
  readonly questions = this._questions.asReadonly();
  readonly session = this._session.asReadonly();
  readonly answers = this._answers.asReadonly();
  readonly answerVersions = this._answerVersions.asReadonly();
  readonly saveStatus = this._saveStatus.asReadonly();

  startLoading(): void {
    this._isLoading.set(true);
    this._hasError.set(false);
  }

  setError(): void {
    this._isLoading.set(false);
    this._hasError.set(true);
  }

  setExamAndQuestions(exam: Exam, questions: Question[]): void {
    this._exam.set(exam);
    this._questions.set(questions);
    this._isLoading.set(false);
    this._hasError.set(false);
  }

  setSession(session: ExamSession): void {
    this._session.set(session);
  }

  setDraftState(
    answers: Record<string, string>,
    versions: Record<string, number>,
    statuses: Record<string, AnswerDraft['syncStatus']>
  ): void {
    this._answers.set(answers);
    this._answerVersions.set(versions);
    this._saveStatus.set(statuses);
    this._isLoading.set(false);
    this._hasError.set(false);
  }

  finishLoading(): void {
    this._isLoading.set(false);
    this._hasError.set(false);
  }

  setAnswer(questionId: string, value: string): void {
    this._answers.update((current) => ({ ...current, [questionId]: value }));
  }

  setDraftSaved(questionId: string, syncStatus: AnswerDraft['syncStatus'], version?: number): void {
    this._saveStatus.update((current) => ({ ...current, [questionId]: syncStatus }));
    if (syncStatus === 'synced' && version !== undefined) {
      this._answerVersions.update((current) => ({ ...current, [questionId]: version }));
    }
  }
}