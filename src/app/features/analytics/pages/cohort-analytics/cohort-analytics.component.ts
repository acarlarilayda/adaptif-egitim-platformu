import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsFacade } from '../../data-access/analytics.facade';

@Component({
  selector: 'app-cohort-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cohort-analytics.component.html',
  styleUrl: './cohort-analytics.component.scss',
})
export class CohortAnalyticsComponent implements OnInit {
  private readonly facade = inject(AnalyticsFacade);

  readonly isLoading = this.facade.isCohortLoading;
  readonly hasError = this.facade.hasCohortError;
  readonly cohortMastery = this.facade.cohortMastery;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.facade.loadCohortMastery();
  }
}