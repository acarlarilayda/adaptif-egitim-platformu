import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LearningPathRepository, PathStepWithContent } from '../../data-access/learning-path.repository';
import { RecommendationRepository, RecommendationView } from '../../../recommendations/data-access/recommendation.repository';
import { AnalyticsRepository, StudentMasteryView } from '../../../analytics/data-access/analytics.repository';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-learning-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './learning-dashboard.component.html',
  styleUrl: './learning-dashboard.component.scss',
})
export class LearningDashboardComponent implements OnInit {
  private readonly pathRepository = inject(LearningPathRepository);
  private readonly recommendationRepository = inject(RecommendationRepository);
  private readonly analyticsRepository = inject(AnalyticsRepository);
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

    this.pathRepository.getPathForStudent(student.id).subscribe({
      next: (steps) => {
        this.nextSteps.set(steps.filter((s) => !s.isCompleted && !s.isLocked).slice(0, 3));

        this.recommendationRepository.getRecommendationsForStudent(student.id).subscribe({
          next: (recs) => {
            this.recommendations.set(recs.slice(0, 3));

            this.analyticsRepository.getMasteryScoresForStudent(student.id).subscribe({
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
