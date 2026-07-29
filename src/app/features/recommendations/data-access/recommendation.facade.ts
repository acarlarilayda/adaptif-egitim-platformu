import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { RecommendationRepository } from './recommendation.repository';
import { RecommendationStore } from '../state/recommendation.store';
import { RecommendationView } from '../models/recommendation-view.model';

@Injectable({ providedIn: 'root' })
export class RecommendationFacade {
  private readonly repository = inject(RecommendationRepository);
  private readonly store = inject(RecommendationStore);

  readonly recommendations = this.store.recommendations;
  readonly isListLoading = this.store.isListLoading;
  readonly hasListError = this.store.hasListError;
  readonly masteryScores = this.store.masteryScores;

  loadListData(studentId: string): void {
    this.store.startListLoading();
    this.repository.getRecommendationsForStudent(studentId).subscribe({
      next: (recommendations) => {
        this.repository.getMasteryScoresForStudent(studentId).subscribe({
          next: (scores) => this.store.setListData(recommendations, scores),
          error: () => this.store.setListError(),
        });
      },
      error: () => this.store.setListError(),
    });
  }

  /** Öğrenme özet panosu gibi başka feature'ların ham veriye ihtiyaç duyduğu durumlar için pass-through. */
  getRecommendationsForStudent(studentId: string): Observable<RecommendationView[]> {
    return this.repository.getRecommendationsForStudent(studentId);
  }

  /**
   * Optimistic dismiss: öneri arka plan isteği tamamlanmadan listeden
   * kaldırılır; istek başarısız olursa önceki liste geri yüklenir.
   */
  dismiss(recommendationId: string): Observable<void> {
    const previousList = this.store.recommendations();
    const optimisticList = previousList.filter(
      (item) => item.recommendation.id !== recommendationId
    );
    this.store.setRecommendations(optimisticList);

    return this.repository.dismissRecommendation(recommendationId).pipe(
      tap({
        error: () => this.store.setRecommendations(previousList),
      })
    );
  }
}