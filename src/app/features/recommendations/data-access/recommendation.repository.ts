import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { Recommendation } from '../../../shared/models/recommendation.model';
import { MasteryScore } from '../../../shared/models/mastery-score.model';
import { MOCK_RECOMMENDATIONS } from '../../../core/api/mock-data/recommendations.mock-data';
import { MOCK_MASTERY_SCORES } from '../../../core/api/mock-data/mastery-scores.mock-data';
import { MOCK_LEARNING_OUTCOMES } from '../../../core/api/mock-data/learning-outcomes.mock-data';

export interface RecommendationView {
  recommendation: Recommendation;
  outcomeTitle: string;
}

@Injectable({ providedIn: 'root' })
export class RecommendationRepository {
  private recommendations: Recommendation[] = [...MOCK_RECOMMENDATIONS];
  private masteryScores: MasteryScore[] = [...MOCK_MASTERY_SCORES];

  getRecommendationsForStudent(studentId: string): Observable<RecommendationView[]> {
    return mockRequest(() => {
      return this.recommendations
        .filter((r) => r.studentId === studentId && !r.isDismissed)
        .map((recommendation) => {
          const outcome = MOCK_LEARNING_OUTCOMES.find(
            (o) => o.id === recommendation.outcomeId
          );
          return {
            recommendation,
            outcomeTitle: outcome ? outcome.title : recommendation.outcomeId,
          };
        });
    });
  }

  getMasteryScoresForStudent(studentId: string): Observable<MasteryScore[]> {
    return mockRequest(() =>
      this.masteryScores.filter((m) => m.studentId === studentId)
    );
  }

  /**
   * Adaptif öneri tamamlanmış veya kilitli
   * içeriği yeniden önermemelidir.Bu metod öneriyi kapatır.
   */
  dismissRecommendation(recommendationId: string): Observable<void> {
    return mockRequest(
      () => {
        const rec = this.recommendations.find((r) => r.id === recommendationId);
        if (rec) {
          rec.isDismissed = true;
        }
      },
      { errorRate: 0.2 }
    );
  }
}