import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mockRequest } from '../../../core/api/mock-transport';
import { ItemAnalysis } from '../../../shared/models/item-analysis.model';
import { MasteryScore } from '../../../shared/models/mastery-score.model';
import { MOCK_ITEM_ANALYSES } from '../../../core/api/mock-data/item-analyses.mock-data';
import { MOCK_MASTERY_SCORES } from '../../../core/api/mock-data/mastery-scores.mock-data';
import { MOCK_LEARNING_OUTCOMES } from '../../../core/api/mock-data/learning-outcomes.mock-data';
import { groupBy } from '../../../shared/utils/array.utils';
import { StudentMasteryView, CohortOutcomeMastery } from '../models/analytics-view.model';
import { MOCK_MASTERY_SCORE_HISTORY } from '../../../core/api/mock-data/mastery-score-history.mock-data';

@Injectable({ providedIn: 'root' })
export class AnalyticsRepository {
  private itemAnalyses: ItemAnalysis[] = [...MOCK_ITEM_ANALYSES];
  private masteryScores: MasteryScore[] = [...MOCK_MASTERY_SCORES];
  private masteryHistory: MasteryScore[] = [...MOCK_MASTERY_SCORE_HISTORY];
  private readonly belowThreshold = 50;

  getItemAnalyses(): Observable<ItemAnalysis[]> {
    return mockRequest(() => [...this.itemAnalyses]);
  }

  getMasteryScoresForStudent(studentId: string): Observable<StudentMasteryView[]> {
    return mockRequest(() =>
      this.masteryScores
        .filter((m) => m.studentId === studentId)
        .map((m) => ({
          outcomeId: m.outcomeId,
          outcomeTitle:
            MOCK_LEARNING_OUTCOMES.find((o) => o.id === m.outcomeId)?.title ?? m.outcomeId,
          score: m.score,
          calculatedAt: m.calculatedAt,
        }))
    );
  }
  /**
   * Bir öğrencinin, her kazanım için zaman içindeki ustalık skoru
   * geçmişini döner (MasteryHeatmap için). getMasteryScoresForStudent'tan
   * farklı olarak birden fazla zaman noktası döndürebilir.
   */
  getMasteryHistoryForStudent(studentId: string): Observable<StudentMasteryView[]> {
    return mockRequest(() =>
      this.masteryHistory
        .filter((m) => m.studentId === studentId)
        .map((m) => ({
          outcomeId: m.outcomeId,
          outcomeTitle:
            MOCK_LEARNING_OUTCOMES.find((o) => o.id === m.outcomeId)?.title ?? m.outcomeId,
          score: m.score,
          calculatedAt: m.calculatedAt,
        }))
        .sort((a, b) => a.calculatedAt.localeCompare(b.calculatedAt))
    );
  }

  /**
   * Her kazanım için kohort genelindeki ortalama ustalık skorunu ve
   * eşik altında kalan öğrenci sayısını hesaplar.
   */
  getCohortMasteryByOutcome(): Observable<CohortOutcomeMastery[]> {
    return mockRequest(() => {
      const grouped = groupBy(this.masteryScores, (m) => m.outcomeId);

      return Object.entries(grouped).map(([outcomeId, scores]) => ({
        outcomeId,
        outcomeTitle: MOCK_LEARNING_OUTCOMES.find((o) => o.id === outcomeId)?.title ?? outcomeId,
        averageScore: Math.round(
          scores.reduce((sum, s) => sum + s.score, 0) / scores.length
        ),
        studentCount: scores.length,
        belowThresholdCount: scores.filter((s) => s.score < this.belowThreshold).length,
      }));
    });
  }
}