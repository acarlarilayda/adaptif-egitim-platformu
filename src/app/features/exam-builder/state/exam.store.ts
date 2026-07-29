import { Injectable, signal } from '@angular/core';
import { Exam } from '../../../shared/models/exam.model';
import { BlueprintWithCoverage } from '../models/exam-operations.model';

@Injectable({ providedIn: 'root' })
export class ExamStore {
  private readonly _exams = signal<Exam[]>([]);
  private readonly _isExamListLoading = signal(true);
  private readonly _hasExamListError = signal(false);

  private readonly _blueprintRows = signal<BlueprintWithCoverage[]>([]);
  private readonly _isBuilderLoading = signal(true);
  private readonly _hasBuilderError = signal(false);

  readonly exams = this._exams.asReadonly();
  readonly isExamListLoading = this._isExamListLoading.asReadonly();
  readonly hasExamListError = this._hasExamListError.asReadonly();

  readonly blueprintRows = this._blueprintRows.asReadonly();
  readonly isBuilderLoading = this._isBuilderLoading.asReadonly();
  readonly hasBuilderError = this._hasBuilderError.asReadonly();

  startExamListLoading(): void {
    this._isExamListLoading.set(true);
    this._hasExamListError.set(false);
  }

  setExams(exams: Exam[]): void {
    this._exams.set(exams);
    this._isExamListLoading.set(false);
    this._hasExamListError.set(false);
  }

  setExamListError(): void {
    this._isExamListLoading.set(false);
    this._hasExamListError.set(true);
  }

  startBuilderLoading(): void {
    this._isBuilderLoading.set(true);
    this._hasBuilderError.set(false);
  }

  setBlueprintRows(rows: BlueprintWithCoverage[]): void {
    this._blueprintRows.set(rows);
    this._isBuilderLoading.set(false);
    this._hasBuilderError.set(false);
  }

  setBuilderError(): void {
    this._isBuilderLoading.set(false);
    this._hasBuilderError.set(true);
  }
}