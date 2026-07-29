import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationFacade } from '../../data-access/recommendation.facade';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-recommendation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendation-list.component.html',
  styleUrl: './recommendation-list.component.scss',
})
export class RecommendationListComponent implements OnInit {
  private readonly facade = inject(RecommendationFacade);
  private readonly auth = inject(AuthService);

  readonly isLoading = this.facade.isListLoading;
  readonly hasError = this.facade.hasListError;
  readonly recommendations = this.facade.recommendations;
  readonly masteryScores = this.facade.masteryScores;
  readonly dismissError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const studentId = this.auth.currentUser().id;
    this.facade.loadListData(studentId);
  }

  dismiss(recommendationId: string): void {
    this.dismissError.set(null);

    this.facade.dismiss(recommendationId).subscribe({
      next: () => {
        // İşlem gerçekten başarılı oldu, optimistic durum kalıcı hale geldi.
      },
      error: () => {
        this.dismissError.set(
          'Öneri kapatılırken bir sorun oluştu, tekrar deneyin.'
        );
      },
    });
  }
}