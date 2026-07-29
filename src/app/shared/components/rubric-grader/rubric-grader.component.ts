import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Rubric, RubricScoreChange } from '../../models/rubric.model';

interface CriterionEditState {
  reason: string;
  errorMessage: string | null;
}

/**
 * Bir rubriğin tüm kriterlerini seviye butonları + gerekçe alanı ile
 * gösterir ve puan geçmişini listeler. Hangi feature'ın hangi servisle
 * puanı kaydedeceğini bilmez — bunun için dışarıdan `scoreUpdater`
 * fonksiyonu enjekte edilir (shared bileşen, feature'lara bağımlı değildir).
 */
@Component({
  selector: 'app-rubric-grader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rubric-grader.component.html',
  styleUrl: './rubric-grader.component.scss',
})
export class RubricGraderComponent {
  @Input({ required: true }) rubric!: Rubric;

  /** Kriter puanı değiştiğinde çağrılır; başarı/başarısızlık Observable üzerinden bildirilir. */
  @Input({ required: true }) scoreUpdater!: (
    criterionId: string,
    points: number,
    reason: string
  ) => Observable<Rubric | undefined>;

  private readonly editState = signal<Record<string, CriterionEditState>>({});

  getReasonValue(criterionId: string): string {
    return this.editState()[criterionId]?.reason ?? '';
  }

  getErrorMessage(criterionId: string): string | null {
    return this.editState()[criterionId]?.errorMessage ?? null;
  }

  onReasonChange(criterionId: string, reason: string): void {
    this.editState.update((state) => ({
      ...state,
      [criterionId]: { reason, errorMessage: null },
    }));
  }

  historyFor(criterionId: string): RubricScoreChange[] {
    return this.rubric.scoreHistory.filter((change) => change.criterionId === criterionId);
  }

  applyScore(criterionId: string, points: number): void {
    const reason = this.getReasonValue(criterionId);

    this.scoreUpdater(criterionId, points, reason).subscribe({
      next: () => {
        this.editState.update((state) => ({
          ...state,
          [criterionId]: { reason, errorMessage: null },
        }));
      },
      error: (err) => {
        this.editState.update((state) => ({
          ...state,
          [criterionId]: { reason, errorMessage: err.message },
        }));
      },
    });
  }
}