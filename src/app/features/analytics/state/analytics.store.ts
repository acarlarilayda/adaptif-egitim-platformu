import { Injectable, signal } from '@angular/core';
import { ItemAnalysis } from '../../../shared/models/item-analysis.model';
import { StudentMasteryView, CohortOutcomeMastery } from '../models/analytics-view.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsStore {
  private readonly _itemAnalyses = signal<ItemAnalysis[]>([]);
  private readonly _isItemAnalysisLoading = signal(true);
  private readonly _hasItemAnalysisError = signal(false);

  private readonly _cohortMastery = signal<CohortOutcomeMastery[]>([]);
  private readonly _isCohortLoading = signal(true);
  private readonly _hasCohortError = signal(false);

  private readonly _studentMasteryScores = signal<StudentMasteryView[]>([]);
  private readonly _isStudentLoading = signal(true);
  private readonly _hasStudentError = signal(false);
  private readonly _masteryHistory = signal<StudentMasteryView[]>([]);
  private readonly _isHistoryLoading = signal(true);
  private readonly _hasHistoryError = signal(false);
  
  readonly itemAnalyses = this._itemAnalyses.asReadonly();
  readonly isItemAnalysisLoading = this._isItemAnalysisLoading.asReadonly();
  readonly hasItemAnalysisError = this._hasItemAnalysisError.asReadonly();

  readonly cohortMastery = this._cohortMastery.asReadonly();
  readonly isCohortLoading = this._isCohortLoading.asReadonly();
  readonly hasCohortError = this._hasCohortError.asReadonly();

  readonly studentMasteryScores = this._studentMasteryScores.asReadonly();
  readonly isStudentLoading = this._isStudentLoading.asReadonly();
  readonly hasStudentError = this._hasStudentError.asReadonly();
  readonly masteryHistory = this._masteryHistory.asReadonly();
  readonly isHistoryLoading = this._isHistoryLoading.asReadonly();
  readonly hasHistoryError = this._hasHistoryError.asReadonly();

  startItemAnalysisLoading(): void {
    this._isItemAnalysisLoading.set(true);
    this._hasItemAnalysisError.set(false);
  }

  setItemAnalyses(data: ItemAnalysis[]): void {
    this._itemAnalyses.set(data);
    this._isItemAnalysisLoading.set(false);
    this._hasItemAnalysisError.set(false);
  }

  setItemAnalysisError(): void {
    this._isItemAnalysisLoading.set(false);
    this._hasItemAnalysisError.set(true);
  }

  startCohortLoading(): void {
    this._isCohortLoading.set(true);
    this._hasCohortError.set(false);
  }

  setCohortMastery(data: CohortOutcomeMastery[]): void {
    this._cohortMastery.set(data);
    this._isCohortLoading.set(false);
    this._hasCohortError.set(false);
  }

  setCohortError(): void {
    this._isCohortLoading.set(false);
    this._hasCohortError.set(true);
  }

  startStudentLoading(): void {
    this._isStudentLoading.set(true);
    this._hasStudentError.set(false);
  }

  setStudentMasteryScores(data: StudentMasteryView[]): void {
    this._studentMasteryScores.set(data);
    this._isStudentLoading.set(false);
    this._hasStudentError.set(false);
  }

  setStudentError(): void {
    this._isStudentLoading.set(false);
    this._hasStudentError.set(true);
  }
  
  startHistoryLoading(): void {
    this._isHistoryLoading.set(true);
    this._hasHistoryError.set(false);
  }

  setMasteryHistory(data: StudentMasteryView[]): void {
    this._masteryHistory.set(data);
    this._isHistoryLoading.set(false);
    this._hasHistoryError.set(false);
  }

  setHistoryError(): void {
    this._isHistoryLoading.set(false);
    this._hasHistoryError.set(true);
  }
}