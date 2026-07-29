import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LearningPathFacade } from '../../data-access/learning-path.facade';
import { PathStepWithContent } from '../../models/learning-path-view.model';
import { RecommendationFacade } from '../../../recommendations/data-access/recommendation.facade';
import { RecommendationView } from '../../../recommendations/models/recommendation-view.model';
import { AnalyticsFacade } from '../../../analytics/data-access/analytics.facade';
import { StudentMasteryView } from '../../../analytics/models/analytics-view.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-learning-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './learning-dashboard.component.html',
  styleUrl: './learning-dashboard.component.scss',
})
export class LearningDashboardComponent implements OnInit {
  private readonly pathFacade = inject(LearningPathFacade);
  private readonly recommendationFacade = inject(RecommendationFacade);
  private readonly analyticsFacade = inject(AnalyticsFacade);
  private readonly auth = inject(AuthService);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  readonly nextSteps = signal<PathStepWithContent[]>([]);
  readonly recommendations = signal<RecommendationView[]>([]);
  readonly masteryScores = signal<StudentMasteryView[]>([]);

  readonly studentName = signal('');

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const student = this.auth.currentUser();
    this.studentName.set(student.name);

    this.pathFacade.getPathForStudent(student.id).subscribe({
      next: (steps) => {
        this.nextSteps.set(steps.filter((s) => !s.isCompleted && !s.isLocked).slice(0, 3));

        this.recommendationFacade.getRecommendationsForStudent(student.id).subscribe({
          next: (recs) => {
            this.recommendations.set(recs.slice(0, 3));

            this.analyticsFacade.getMasteryScoresForStudent(student.id).subscribe({
              next: (scores) => {
                this.masteryScores.set(scores);
                this.isLoading.set(false);
              },
              error: () => {
                this.hasError.set(true);
                this.isLoading.set(false);
              },
            });
          },
          error: () => {
            this.hasError.set(true);
            this.isLoading.set(false);
          },
        });
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}