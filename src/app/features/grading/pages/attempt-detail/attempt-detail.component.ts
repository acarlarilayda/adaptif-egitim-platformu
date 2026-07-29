import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { GradingFacade } from '../../data-access/grading.facade';
import { Rubric } from '../../../../shared/models/rubric.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { RubricGraderComponent } from '../../../../shared/components/rubric-grader/rubric-grader.component';

@Component({
  selector: 'app-attempt-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, RubricGraderComponent],
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

  /** RubricGrader'a verilen, puan değişikliğini gerçek servise ileten fonksiyon. */
  scoreUpdaterFor(rubricId: string) {
    return (criterionId: string, points: number, reason: string): Observable<Rubric | undefined> =>
      this.facade.updateCriterionScore(rubricId, criterionId, points, reason, this.auth.currentUser().id);
  }
}