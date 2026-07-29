import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsStore } from '../state/analytics.store';
import { StudentMasteryView } from '../models/analytics-view.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsFacade {
  private readonly repository = inject(AnalyticsRepository);
  private readonly store = inject(AnalyticsStore);

  readonly itemAnalyses = this.store.itemAnalyses;
  readonly isItemAnalysisLoading = this.store.isItemAnalysisLoading;
  readonly hasItemAnalysisError = this.store.hasItemAnalysisError;

  readonly cohortMastery = this.store.cohortMastery;
  readonly isCohortLoading = this.store.isCohortLoading;
  readonly hasCohortError = this.store.hasCohortError;

  readonly studentMasteryScores = this.store.studentMasteryScores;
  readonly isStudentLoading = this.store.isStudentLoading;
  readonly hasStudentError = this.store.hasStudentError;

  loadItemAnalyses(): void {
    this.store.startItemAnalysisLoading();
    this.repository.getItemAnalyses().subscribe({
      next: (data) => this.store.setItemAnalyses(data),
      error: () => this.store.setItemAnalysisError(),
    });
  }

  loadCohortMastery(): void {
    this.store.startCohortLoading();
    this.repository.getCohortMasteryByOutcome().subscribe({
      next: (data) => this.store.setCohortMastery(data),
      error: () => this.store.setCohortError(),
    });
  }

  loadStudentMastery(studentId: string): void {
    this.store.startStudentLoading();
    this.repository.getMasteryScoresForStudent(studentId).subscribe({
      next: (scores) => this.store.setStudentMasteryScores(scores),
      error: () => this.store.setStudentError(),
    });
  }

  /** Öğrenme özet panosu gibi başka feature'ların ham veriye ihtiyaç duyduğu durumlar için pass-through. */
  getMasteryScoresForStudent(studentId: string): Observable<StudentMasteryView[]> {
    return this.repository.getMasteryScoresForStudent(studentId);
  }
}