import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsRepository, CohortOutcomeMastery } from '../../data-access/analytics.repository';

@Component({
  selector: 'app-cohort-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cohort-analytics.component.html',
  styleUrl: './cohort-analytics.component.scss',
})
export class CohortAnalyticsComponent implements OnInit {
  private readonly analyticsRepository = inject(AnalyticsRepository);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly cohortMastery = signal<CohortOutcomeMastery[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.analyticsRepository.getCohortMasteryByOutcome().subscribe({
      next: (data) => {
        this.cohortMastery.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}