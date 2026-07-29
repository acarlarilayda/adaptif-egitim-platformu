import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GradingFacade } from '../../data-access/grading.facade';
import { Rubric } from '../../../../shared/models/rubric.model';
import { AuthService } from '../../../../core/auth/auth.service';

interface RubricEditState {
  [criterionId: string]: {
    selectedPoints: number | null;
    reason: string;
    errorMessage: string | null;
  };
}

@Component({
  selector: 'app-grading-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './grading-list.component.html',
  styleUrl: './grading-list.component.scss',
})
export class GradingListComponent implements OnInit {
  private readonly facade = inject(GradingFacade);
  private readonly auth = inject(AuthService);

  readonly isLoading = this.facade.isListLoading;
  readonly hasError = this.facade.hasListError;
  readonly attempts = this.facade.attempts;

  readonly openQuestionIds = signal<Set<string>>(new Set());
  readonly editState = signal<Record<string, RubricEditState>>({});

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.facade.loadAttempts();
  }

  toggleRubric(questionId: string): void {
    const openIds = new Set(this.openQuestionIds());

    if (openIds.has(questionId)) {
      openIds.delete(questionId);
      this.openQuestionIds.set(openIds);
      return;
    }

    openIds.add(questionId);
    this.openQuestionIds.set(openIds);
    this.facade.loadRubricForQuestion(questionId);
  }

  isRubricOpen(questionId: string): boolean {
    return this.openQuestionIds().has(questionId);
  }

  getRubric(questionId: string): Rubric | undefined {
    return this.facade.rubricsByQuestionId()[questionId];
  }

  getReasonValue(rubricId: string, criterionId: string): string {
    return this.editState()[rubricId]?.[criterionId]?.reason ?? '';
  }

  getErrorMessage(rubricId: string, criterionId: string): string | null {
    return this.editState()[rubricId]?.[criterionId]?.errorMessage ?? null;
  }

  onReasonChange(rubricId: string, criterionId: string, reason: string): void {
    const state = this.editState();
    const rubricState = state[rubricId] ?? {};
    this.editState.set({
      ...state,
      [rubricId]: {
        ...rubricState,
        [criterionId]: {
          selectedPoints: rubricState[criterionId]?.selectedPoints ?? null,
          reason,
          errorMessage: null,
        },
      },
    });
  }

  applyScore(rubricId: string, criterionId: string, points: number): void {
    const reason = this.getReasonValue(rubricId, criterionId);

    this.facade
      .updateCriterionScore(rubricId, criterionId, points, reason, this.auth.currentUser().id)
      .subscribe({
        next: () => {},
        error: (err) => {
          const state = this.editState();
          const rubricState = state[rubricId] ?? {};
          this.editState.set({
            ...state,
            [rubricId]: {
              ...rubricState,
              [criterionId]: {
                selectedPoints: rubricState[criterionId]?.selectedPoints ?? null,
                reason,
                errorMessage: err.message,
              },
            },
          });
        },
      });
  }
}