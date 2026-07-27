import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradingRepository } from '../../data-access/grading.repository';
import { Attempt } from '../../../../shared/models/attempt.model';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './grading-list.component.html',
  styleUrl: './grading-list.component.scss',
})
export class GradingListComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly attempts = signal<Attempt[]>([]);
  readonly openRubrics = signal<Record<string, Rubric>>({});
  readonly openQuestionIds = signal<Set<string>>(new Set());
  readonly editState = signal<Record<string, RubricEditState>>({});

  constructor(
    private readonly gradingRepository: GradingRepository,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.gradingRepository.getAttempts().subscribe({
      next: (attempts) => {
        this.attempts.set(attempts);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
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

    this.gradingRepository.getRubricForQuestion(questionId).subscribe({
      next: (rubric) => {
        if (rubric) {
          this.openRubrics.set({ ...this.openRubrics(), [questionId]: rubric });
        }
      },
    });
  }

  isRubricOpen(questionId: string): boolean {
    return this.openQuestionIds().has(questionId);
  }

  getRubric(questionId: string): Rubric | undefined {
    return this.openRubrics()[questionId];
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

    this.gradingRepository
      .updateCriterionScore(rubricId, criterionId, points, reason, this.auth.currentUser().id)
      .subscribe({
        next: (updatedRubric) => {
          if (updatedRubric) {
            this.openRubrics.set({
              ...this.openRubrics(),
              [updatedRubric.questionId]: updatedRubric,
            });
          }
        },
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