import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { GradingRepository } from './grading.repository';
import { GradingStore } from '../state/grading.store';
import { Rubric } from '../../../shared/models/rubric.model';

@Injectable({ providedIn: 'root' })
export class GradingFacade {
  private readonly repository = inject(GradingRepository);
  private readonly store = inject(GradingStore);

  readonly attempts = this.store.attempts;
  readonly isListLoading = this.store.isListLoading;
  readonly hasListError = this.store.hasListError;

  readonly selectedAttempt = this.store.selectedAttempt;
  readonly isDetailLoading = this.store.isDetailLoading;
  readonly hasDetailError = this.store.hasDetailError;

  readonly rubricsByQuestionId = this.store.rubricsByQuestionId;

  loadAttempts(): void {
    this.store.startListLoading();
    this.repository.getAttempts().subscribe({
      next: (attempts) => this.store.setAttempts(attempts),
      error: () => this.store.setListError(),
    });
  }

  loadAttemptDetail(attemptId: string): void {
    this.store.startDetailLoading();
    this.repository.getAttempts().subscribe({
      next: (attempts) => {
        const found = attempts.find((a) => a.id === attemptId);
        if (!found) {
          this.store.setDetailError();
          return;
        }
        this.store.setSelectedAttempt(found);
      },
      error: () => this.store.setDetailError(),
    });
  }

  loadRubricForQuestion(questionId: string): void {
    this.repository.getRubricForQuestion(questionId).subscribe({
      next: (rubric) => {
        if (rubric) {
          this.store.setRubric(rubric);
        }
      },
    });
  }

  updateCriterionScore(
    rubricId: string,
    criterionId: string,
    points: number,
    reason: string,
    changedBy: string
  ): Observable<Rubric | undefined> {
    return this.repository.updateCriterionScore(rubricId, criterionId, points, reason, changedBy).pipe(
      tap((rubric) => {
        if (rubric) {
          this.store.setRubric(rubric);
        }
      })
    );
  }
}