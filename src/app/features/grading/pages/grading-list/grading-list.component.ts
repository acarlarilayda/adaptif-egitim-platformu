import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { GradingFacade } from '../../data-access/grading.facade';
import { Rubric } from '../../../../shared/models/rubric.model';
import { AttemptStatus } from '../../../../shared/models/attempt.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { RubricGraderComponent } from '../../../../shared/components/rubric-grader/rubric-grader.component';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-grading-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RubricGraderComponent, FormsModule],
  templateUrl: './grading-list.component.html',
  styleUrl: './grading-list.component.scss',
})
export class GradingListComponent implements OnInit {
  private readonly facade = inject(GradingFacade);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isLoading = this.facade.isListLoading;
  readonly hasError = this.facade.hasListError;
  readonly attempts = this.facade.attempts;

  readonly openQuestionIds = signal<Set<string>>(new Set());

  readonly statusFilter = signal<AttemptStatus | 'all'>('all');
  readonly sortDirection = signal<SortDirection>('desc');

  /** Durum filtresi + puana göre sıralamayı uygular (server-side davranışı taklit eder). */
  readonly filteredAttempts = computed(() => {
    const status = this.statusFilter();
    const direction = this.sortDirection();

    let result = this.attempts();

    if (status !== 'all') {
      result = result.filter((a) => a.status === status);
    }

    result = [...result].sort((a, b) =>
      direction === 'asc' ? a.totalScore - b.totalScore : b.totalScore - a.totalScore
    );

    return result;
  });

  ngOnInit(): void {
    const urlStatus = this.route.snapshot.queryParamMap.get('status');
    if (urlStatus) {
      this.statusFilter.set(urlStatus as AttemptStatus | 'all');
    }
    this.loadData();
  }

  onStatusFilterChange(status: AttemptStatus | 'all'): void {
    this.statusFilter.set(status);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: status === 'all' ? null : status },
      queryParamsHandling: 'merge',
    });
  }

  toggleSort(): void {
    this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
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