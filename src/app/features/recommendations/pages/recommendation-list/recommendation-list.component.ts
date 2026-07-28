import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationRepository, RecommendationView } from '../../data-access/recommendation.repository';
import { MasteryScore } from '../../../../shared/models/mastery-score.model';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-recommendation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendation-list.component.html',
  styleUrl: './recommendation-list.component.scss',
})
export class RecommendationListComponent implements OnInit {
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly recommendations = signal<RecommendationView[]>([]);
  readonly dismissError = signal<string | null>(null);
  readonly masteryScores = signal<MasteryScore[]>([]);

  constructor(
    private readonly recommendationRepository: RecommendationRepository,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const studentId = this.auth.currentUser().id;

    this.recommendationRepository.getRecommendationsForStudent(studentId).subscribe({
      next: (recommendations) => {
        this.recommendations.set(recommendations);

        this.recommendationRepository.getMasteryScoresForStudent(studentId).subscribe({
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
  }

  dismiss(recommendationId: string): void {
    this.dismissError.set(null);

    // Optimistic update: öneriyi arka plan isteği tamamlanmadan hemen
    // listeden kaldırıyoruz, böylece kullanıcı beklemeden anında geri bildirim alır.
    const previousList = this.recommendations();
    const optimisticList = previousList.filter(
      (item) => item.recommendation.id !== recommendationId
    );
    this.recommendations.set(optimisticList);

    this.recommendationRepository.dismissRecommendation(recommendationId).subscribe({
      next: () => {
        // İşlem gerçekten başarılı oldu, optimistic durum kalıcı hale geldi.
      },
      error: () => {
        // İşlem başarısız oldu: listeyi eski haline geri alıyoruz ve
        // kullanıcıya ne olduğunu bildiriyoruz.
        this.recommendations.set(previousList);
        this.dismissError.set(
          'Öneri kapatılırken bir sorun oluştu, tekrar deneyin.'
        );
      },
    });
  }
}