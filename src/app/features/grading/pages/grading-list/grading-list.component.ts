import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { GradingFacade } from '../../data-access/grading.facade';
import { Rubric } from '../../../../shared/models/rubric.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { RubricGraderComponent } from '../../../../shared/components/rubric-grader/rubric-grader.component';

@Component({
  selector: 'app-grading-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RubricGraderComponent],
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

  /** RubricGrader'a verilen, puan değişikliğini gerçek servise ileten fonksiyon. */
  scoreUpdaterFor(rubricId: string) {
    return (criterionId: string, points: number, reason: string): Observable<Rubric | undefined> =>
      this.facade.updateCriterionScore(rubricId, criterionId, points, reason, this.auth.currentUser().id);
  }
}