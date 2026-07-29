import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GradingFacade } from '../../data-access/grading.facade';
import { Rubric } from '../../../../shared/models/rubric.model';
import { AuthService } from '../../../../core/auth/auth.service';

interface RubricEditState {
  [criterionId: string]: {
    reason: string;
    errorMessage: string | null;
  };
}

@Component({
  selector: 'app-attempt-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './attempt-detail.component.html',
  styleUrl: './attempt-detail.component.scss',
})
export class AttemptDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(GradingFacade);
  private readonly auth = inject(AuthService);

  readonly isLoading = this.facade.isDetailLoading;
  readonly hasError = this.facade.hasDetailError;
  readonly attempt = this.facade.selectedAttempt;

  readonly openQuestionIds = signal<Set<string>>(new Set());
  readonly editState = signal<Record<string, RubricEditState>>({});

  ngOnInit(): void {
    const attemptId = this.route.snapshot.paramMap.get('attemptId') ?? '';
    this.facade.loadAttemptDetail(attemptId);
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
        [criterionId]: { reason, errorMessage: null },
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
              [criterionId]: { reason, errorMessage: err.message },
            },
          });
        },
      });
  }
}