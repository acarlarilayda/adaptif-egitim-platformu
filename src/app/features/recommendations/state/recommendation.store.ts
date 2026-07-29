import { Injectable, signal } from '@angular/core';
import { MasteryScore } from '../../../shared/models/mastery-score.model';
import { RecommendationView } from '../models/recommendation-view.model';

@Injectable({ providedIn: 'root' })
export class RecommendationStore {
  private readonly _recommendations = signal<RecommendationView[]>([]);
  private readonly _isListLoading = signal(true);
  private readonly _hasListError = signal(false);
  private readonly _masteryScores = signal<MasteryScore[]>([]);

  readonly recommendations = this._recommendations.asReadonly();
  readonly isListLoading = this._isListLoading.asReadonly();
  readonly hasListError = this._hasListError.asReadonly();
  readonly masteryScores = this._masteryScores.asReadonly();

  startListLoading(): void {
    this._isListLoading.set(true);
    this._hasListError.set(false);
  }

  setListData(recommendations: RecommendationView[], masteryScores: MasteryScore[]): void {
    this._recommendations.set(recommendations);
    this._masteryScores.set(masteryScores);
    this._isListLoading.set(false);
    this._hasListError.set(false);
  }

  setListError(): void {
    this._isListLoading.set(false);
    this._hasListError.set(true);
  }

  /** Optimistic dismiss ve rollback için doğrudan liste güncellemesi. */
  setRecommendations(recommendations: RecommendationView[]): void {
    this._recommendations.set(recommendations);
  }
}